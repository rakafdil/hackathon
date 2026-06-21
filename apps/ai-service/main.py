"""
Cafescope AI Service – FastAPI backend for agronomy intelligence.

Endpoints:
  POST /chat         – AI agronomist Q&A (OpenAI or template fallback)
  POST /ndvi         – Satellite NDVI via AgroMonitoring API (polygon-based)
  POST /weather      – Weather + agro data (OpenWeather or AgroMonitoring)
  POST /recommend    – Planting recommendation (combines NDVI + weather + rules)
  GET  /health       – Health check
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
AGROMONITORING_API_KEY = os.getenv("AGROMONITORING_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEE_SERVICE_ACCOUNT = os.getenv("GEE_SERVICE_ACCOUNT", "")

# Groq API base URL (OpenAI-compatible endpoint)
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama-3.3-70b-versatile"

# ── AgroMonitoring base URLs ─────────────────────────────────────────────────
AM_BASE = "http://api.agromonitoring.com/agro/1.0"
OW_BASE = "https://api.openweathermap.org/data/2.5"

# ── Polygon cache (lat,lng → polygon_id) ─────────────────────────────────────
_polygon_cache: dict[str, str] = {}

# ── GEE (optional) ───────────────────────────────────────────────────────────
ee_available = False
try:
    import ee

    if GEE_SERVICE_ACCOUNT:
        credentials = ee.ServiceAccountCredentials(
            GEE_SERVICE_ACCOUNT,
            key_data=os.getenv("GEE_PRIVATE_KEY", ""),
        )
        ee.Initialize(credentials)
        ee_available = True
        print("[GEE] Initialized with service account")
    else:
        print("[GEE] No service account configured – using fallback NDVI")
except ImportError:
    print("[GEE] earthengine-api not installed – using fallback NDVI")


# ── Request / Response models ─────────────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, description="User question")
    location: Optional[str] = None
    commodity: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str


class CoordsRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class NdviRequest(CoordsRequest):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    polygon_id: Optional[str] = Field(
        None, description="Existing AgroMonitoring polygon ID (skip polygon creation)"
    )


class NdviStats(BaseModel):
    mean: Optional[float] = None
    median: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    std: Optional[float] = None
    p25: Optional[float] = None
    p75: Optional[float] = None
    num_pixels: Optional[int] = None


class NdviResponse(BaseModel):
    ndvi_score: float = Field(..., ge=0, le=1, description="0=bare soil, 1=dense vegetation")
    vegetation_health: str = Field(..., description="POOR | MODERATE | GOOD | EXCELLENT")
    trend: str = Field(..., description="INCREASING | STABLE | DECREASING")
    source: str = Field(..., description="AGROMONITORING | GEE | FALLBACK")
    polygon_id: Optional[str] = Field(None, description="AgroMonitoring polygon ID")
    satellite: Optional[str] = Field(None, description="l8 | s2 | modis")
    stats: Optional[NdviStats] = None


class WeatherResponse(BaseModel):
    temperature: float
    rainfall: float
    humidity: float
    ndvi_proxy: float = Field(..., description="Estimated NDVI from vegetation health")
    source: str = Field(..., description="AGROMONITORING | OPENWEATHER | FALLBACK")


class RecommendRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    commodity: str = "RICE"
    planting_date: Optional[str] = None


class RecommendResponse(BaseModel):
    recommendation: str = Field(..., description="PLANT_NOW | DELAY")
    suitability_score: int = Field(..., ge=0, le=100)
    flood_risk: str = Field(..., description="LOW | MEDIUM | HIGH")
    drought_risk: str = Field(..., description="LOW | MEDIUM | HIGH")
    estimated_yield: float = Field(..., description="ton/ha")
    ndvi_score: float
    temperature: float
    rainfall: float
    reasoning: str


# ── App setup ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Cafescope AI Service starting...")
    yield
    print("Cafescope AI Service shutting down.")


app = FastAPI(
    title="Cafescope AI Service",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ───────────────────────────────────────────────────────────────────
def classify_vegetation(ndvi: float) -> str:
    if ndvi < 0.2:
        return "POOR"
    elif ndvi < 0.4:
        return "MODERATE"
    elif ndvi < 0.7:
        return "GOOD"
    return "EXCELLENT"


def classify_risk_level(value: float, low_thresh: float, high_thresh: float) -> str:
    if value < low_thresh:
        return "LOW"
    elif value < high_thresh:
        return "MEDIUM"
    return "HIGH"


def coords_to_geojson_polygon(lat: float, lng: float, size_km: float = 1.0) -> dict:
    """
    Create a square GeoJSON polygon centered on (lat, lng).
    size_km: side length in km (default 1km ≈ typical farm area).
    """
    # Approximate degrees per km at given latitude
    deg_per_km_lat = 1.0 / 111.32
    deg_per_km_lng = 1.0 / (111.32 * max(0.01, abs(
        __import__("math").cos(__import__("math").radians(lat))
    )))

    half = size_km / 2.0
    dlat = half * deg_per_km_lat
    dlng = half * deg_per_km_lng

    # 5-point polygon (closed ring): SW → SE → NE → NW → SW
    coords = [
        [lng - dlng, lat - dlat],  # SW
        [lng + dlng, lat - dlat],  # SE
        [lng + dlng, lat + dlat],  # NE
        [lng - dlng, lat + dlat],  # NW
        [lng - dlng, lat - dlat],  # close ring
    ]

    return {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [coords],
        },
    }


def detect_trend(history: list[dict]) -> str:
    """Detect NDVI trend from history entries (oldest → newest)."""
    if len(history) < 2:
        return "STABLE"
    means = [h.get("data", {}).get("mean", 0) for h in history if h.get("data", {}).get("mean")]
    if len(means) < 2:
        return "STABLE"
    first_half = sum(means[: len(means) // 2]) / (len(means) // 2)
    second_half = sum(means[len(means) // 2 :]) / (len(means) - len(means) // 2)
    diff = second_half - first_half
    if diff > 0.03:
        return "INCREASING"
    elif diff < -0.03:
        return "DECREASING"
    return "STABLE"


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "agromonitoring_configured": bool(AGROMONITORING_API_KEY),
        "ee_available": ee_available,
        "groq_configured": bool(GROQ_API_KEY),
    }


@app.head("/")
async def head_root():
    return PlainTextResponse("")


# ── POST /chat ────────────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """AI agronomist Q&A. Uses Groq (Llama) if configured, otherwise returns a smart template."""
    if GROQ_API_KEY:
        return await _chat_groq(req)
    return _chat_template(req)


async def _chat_groq(req: ChatRequest) -> ChatResponse:
    """Call Groq (Llama 3.3 70B) with agronomy system prompt."""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)

    system_prompt = (
        "You are an expert agronomist assistant for Indonesian farmers. "
        "You help with planting decisions, weather interpretation, NDVI analysis, "
        "and market price understanding. Answer concisely in Indonesian. "
        f"Context: location={req.location or 'unknown'}, commodity={req.commodity or 'general'}."
    )

    resp = await client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.question},
        ],
        max_tokens=500,
        temperature=0.7,
    )

    answer = resp.choices[0].message.content or "Maaf, saya tidak dapat menghasilkan jawaban."
    return ChatResponse(answer=answer)


def _chat_template(req: ChatRequest) -> ChatResponse:
    """Fallback template response when no LLM is available."""
    loc = req.location or "wilayah Anda"
    commodity = req.commodity or "umum"
    answer = (
        f"[Mode Template – LLM belum dikonfigurasi]\n\n"
        f"Terkait pertanyaan Anda tentang \"{req.question}\" "
        f"untuk wilayah {loc} (komoditas: {commodity}):\n\n"
        f"- Pantau NDVI dan kondisi cuaca secara berkala melalui dashboard.\n"
        f"- Jika risiko banjir tinggi, pertimbangkan menunda penanaman.\n"
        f"- Periksa harga pasar regional sebelum menjual hasil panen.\n\n"
        f"Untuk jawaban yang lebih akurat, konfigurasikan GROQ_API_KEY di environment."
    )
    return ChatResponse(answer=answer)


# ── POST /ndvi ────────────────────────────────────────────────────────────────
@app.post("/ndvi", response_model=NdviResponse)
async def get_ndvi(req: NdviRequest):
    """
    Get NDVI score for coordinates.
    Priority: AgroMonitoring (polygon-based) → GEE → fallback.
    """
    # 1. Try AgroMonitoring API (polygon-based NDVI)
    if AGROMONITORING_API_KEY:
        result = await _ndvi_agromonitoring(req)
        if result:
            return result

    # 2. Try GEE
    if ee_available:
        return await _ndvi_gee(req)

    # 3. Fallback
    return _ndvi_fallback(req)


async def _get_or_create_polygon(lat: float, lng: float) -> Optional[str]:
    """
    Get or create an AgroMonitoring polygon for the given coordinates.
    Uses in-memory cache to avoid re-creating polygons.
    Returns polygon_id or None on failure.
    """
    cache_key = f"{lat:.3f},{lng:.3f}"
    if cache_key in _polygon_cache:
        return _polygon_cache[cache_key]

    geojson = coords_to_geojson_polygon(lat, lng)

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{AM_BASE}/poly",
                params={"appid": AGROMONITORING_API_KEY},
                json=geojson,
            )
            resp.raise_for_status()
            data = resp.json()

        poly_id = data.get("id")
        if poly_id:
            _polygon_cache[cache_key] = poly_id
            print(f"[AgroMonitoring] Created polygon {poly_id} for ({lat}, {lng})")
            return poly_id
        else:
            print(f"[AgroMonitoring] No polygon ID returned: {data}")
            return None
    except Exception as e:
        print(f"[AgroMonitoring] Failed to create polygon: {e}")
        return None


async def _ndvi_agromonitoring(req: NdviRequest) -> Optional[NdviResponse]:
    """
    Query NDVI history from AgroMonitoring API using polygon.
    Flow:
      1. Create/get polygon from coordinates
      2. Query NDVI history for that polygon
      3. Parse latest entry for mean NDVI + statistics
    """
    # Step 1: Get polygon ID
    poly_id = req.polygon_id
    if not poly_id:
        poly_id = await _get_or_create_polygon(req.latitude, req.longitude)
    if not poly_id:
        return None

    # Step 2: Build date range (unix timestamps)
    end_date = req.end_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start_date = req.start_date or (datetime.now(timezone.utc) - timedelta(days=90)).strftime("%Y-%m-%d")

    start_ts = int(datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp())
    end_ts = int(datetime.strptime(end_date, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp())

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{AM_BASE}/ndvi/history",
                params={
                    "appid": AGROMONITORING_API_KEY,
                    "polyid": poly_id,
                    "start": start_ts,
                    "end": end_ts,
                },
            )
            resp.raise_for_status()
            history = resp.json()

        if not history or not isinstance(history, list):
            print(f"[AgroMonitoring] Empty NDVI history for polygon {poly_id}")
            return None

        # Step 3: Get latest entry
        # Sort by date descending (most recent first)
        history_sorted = sorted(history, key=lambda x: x.get("dt", 0), reverse=True)
        latest = history_sorted[0]

        data = latest.get("data", {})
        mean_ndvi = data.get("mean", 0.5)
        mean_ndvi = max(0.0, min(1.0, float(mean_ndvi)))

        # Detect trend from history
        trend = detect_trend(history_sorted)

        # Build stats
        stats = NdviStats(
            mean=data.get("mean"),
            median=data.get("median"),
            min=data.get("min"),
            max=data.get("max"),
            std=data.get("std"),
            p25=data.get("p25"),
            p75=data.get("p75"),
            num_pixels=data.get("num"),
        )

        source_label = "AGROMONITORING"
        satellite = latest.get("source", "unknown")  # l8, s2, etc.

        return NdviResponse(
            ndvi_score=round(mean_ndvi, 3),
            vegetation_health=classify_vegetation(mean_ndvi),
            trend=trend,
            source=source_label,
            polygon_id=poly_id,
            satellite=satellite,
            stats=stats,
        )
    except Exception as e:
        print(f"[AgroMonitoring] NDVI query failed: {e} – falling back")
        return None


async def _ndvi_gee(req: NdviRequest) -> NdviResponse:
    """Query MODIS NDVI from Google Earth Engine."""
    end = req.end_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start = req.start_date or (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")

    try:
        geometry = ee.Geometry.Point(req.longitude, req.latitude)
        collection = (
            ee.ImageCollection("MODIS/061/MOD13Q1")
            .filterDate(start, end)
            .filterBounds(geometry)
        )
        ndvi_image = collection.median()
        ndvi_value = (
            ndvi_image.select("NDVI")
            .multiply(0.0001)
            .reduceRegion(ee.Reducer.mean(), geometry, 250)
            .get("NDVI")
            .getInfo()
        )

        ndvi = float(ndvi_value) if ndvi_value is not None else 0.5
        ndvi = max(0.0, min(1.0, ndvi))

        return NdviResponse(
            ndvi_score=round(ndvi, 3),
            vegetation_health=classify_vegetation(ndvi),
            trend="STABLE",
            source="GEE",
        )
    except Exception as e:
        print(f"[GEE] Error: {e} – falling back")
        return _ndvi_fallback(req)


def _ndvi_fallback(req: NdviRequest) -> NdviResponse:
    """Estimate NDVI based on latitude/climate zone."""
    lat = abs(req.latitude)
    if lat < 10:
        base_ndvi = 0.72
    elif lat < 20:
        base_ndvi = 0.65
    elif lat < 30:
        base_ndvi = 0.55
    else:
        base_ndvi = 0.45

    return NdviResponse(
        ndvi_score=round(base_ndvi, 3),
        vegetation_health=classify_vegetation(base_ndvi),
        trend="STABLE",
        source="FALLBACK",
    )


# ── POST /weather ────────────────────────────────────────────────────────────
@app.post("/weather", response_model=WeatherResponse)
async def get_weather(req: CoordsRequest):
    """Get weather data. Uses OpenWeather/AgroMonitoring if configured, otherwise fallback."""
    if AGROMONITORING_API_KEY:
        return await _weather_openweathermap(req)
    return _weather_fallback(req)


async def _weather_openweathermap(req: CoordsRequest) -> WeatherResponse:
    """
    Fetch current weather from OpenWeather API.
    Uses same AGROMONITORING_API_KEY (OpenWeather ecosystem).
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{OW_BASE}/weather",
                params={
                    "lat": req.latitude,
                    "lon": req.longitude,
                    "appid": AGROMONITORING_API_KEY,
                    "units": "metric",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        temp = data.get("main", {}).get("temp", 28.0)
        humidity = data.get("main", {}).get("humidity", 70.0)

        # Estimate rainfall from weather description
        desc = data.get("weather", [{}])[0].get("main", "").lower()
        rainfall = 0.0
        if "rain" in desc or "drizzle" in desc:
            rainfall = data.get("rain", {}).get("1h", 5.0)
        elif "thunderstorm" in desc:
            rainfall = data.get("rain", {}).get("1h", 15.0)

        ndvi_proxy = min(1.0, max(0.0, humidity / 100.0 * 0.9))

        return WeatherResponse(
            temperature=temp,
            rainfall=rainfall,
            humidity=humidity,
            ndvi_proxy=round(ndvi_proxy, 3),
            source="OPENWEATHER",
        )
    except Exception as e:
        print(f"[OpenWeather] Error: {e} – falling back")
        return _weather_fallback(req)


def _weather_fallback(req: CoordsRequest) -> WeatherResponse:
    """Fallback weather for Indonesian tropical climate."""
    return WeatherResponse(
        temperature=29.5,
        rainfall=120.0,
        humidity=75.0,
        ndvi_proxy=0.68,
        source="FALLBACK",
    )


# ── POST /recommend ──────────────────────────────────────────────────────────
@app.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    """Generate planting recommendation combining NDVI + weather + agronomy rules."""
    coords = CoordsRequest(latitude=req.latitude, longitude=req.longitude)

    # Gather NDVI data (priority: AgroMonitoring → GEE → fallback)
    ndvi_req = NdviRequest(latitude=req.latitude, longitude=req.longitude)
    ndvi_data = await get_ndvi(ndvi_req)

    # Gather weather data
    weather_data = await get_weather(coords)

    ndvi = ndvi_data.ndvi_score
    temp = weather_data.temperature
    rainfall = weather_data.rainfall

    # ── Agronomy rules ──────────────────────────────────────────────────
    flood_risk = classify_risk_level(rainfall, 80.0, 200.0)

    drought_score = max(0, (temp - 25) * 5 + (150 - rainfall))
    drought_risk = classify_risk_level(drought_score, 30.0, 80.0)

    risk_penalty = (
        (20 if flood_risk == "HIGH" else 10 if flood_risk == "MEDIUM" else 0)
        + (20 if drought_risk == "HIGH" else 10 if drought_risk == "MEDIUM" else 0)
    )
    suitability = max(0, min(100, round(ndvi * 100 - risk_penalty + 20)))

    should_delay = flood_risk == "HIGH" or drought_risk == "HIGH"
    recommendation = "DELAY" if should_delay else "PLANT_NOW"

    estimated_yield = round((suitability / 100) * 7.5, 1)

    # Build reasoning with data source info
    source_info = f"src={ndvi_data.source}"
    if ndvi_data.polygon_id:
        source_info += f",poly={ndvi_data.polygon_id[:8]}.."
    if ndvi_data.satellite:
        source_info += f",sat={ndvi_data.satellite}"

    reasoning = (
        f"NDVI={ndvi:.2f} ({ndvi_data.vegetation_health}, {source_info}), "
        f"Temp={temp:.1f}°C, Rainfall={rainfall:.0f}mm. "
        f"Flood risk={flood_risk}, Drought risk={drought_risk}. "
        f"{'Delay planting due to high risk.' if should_delay else 'Conditions favorable for planting.'}"
    )

    return RecommendResponse(
        recommendation=recommendation,
        suitability_score=suitability,
        flood_risk=flood_risk,
        drought_risk=drought_risk,
        estimated_yield=estimated_yield,
        ndvi_score=ndvi,
        temperature=temp,
        rainfall=rainfall,
        reasoning=reasoning,
    )
