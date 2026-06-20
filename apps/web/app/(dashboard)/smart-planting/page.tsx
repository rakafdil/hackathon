"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, CloudRain, Thermometer, Droplets, Sprout, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy data for recommendations
const plantingRecommendations = {
  "rice": {
    bestTime: "November - Desember",
    weather: "Hujan ringan, suhu 25-30°C",
    soil: "Kelembaban optimal (70-80%)",
    risk: "Rendah",
    riskVariant: "bg-green-100 text-green-800 border-green-200",
    tips: "Siapkan irigasi dan pastikan drainase baik sebelum musim tanam dimulai."
  },
  "corn": {
    bestTime: "Oktober - November",
    weather: "Cerah berawan, suhu 24-32°C",
    soil: "Tanah gembur dengan pH 6-7",
    risk: "Sedang",
    riskVariant: "bg-yellow-100 text-yellow-800 border-yellow-200",
    tips: "Monitor kelembaban tanah secara berkala dan lakukan pemupukan susulan."
  },
  "soybean": {
    bestTime: "September - Oktober",
    weather: "Kering, suhu 23-28°C",
    soil: "Tanah lempung berpasir",
    risk: "Rendah",
    riskVariant: "bg-green-100 text-green-800 border-green-200",
    tips: "Hindari periode hujan lebat dan pastikan drainase lahan optimal."
  }
};

const weatherForecast = [
  { day: "Sen", icon: "🌧️", temp: "26°C", desc: "Hujan" },
  { day: "Sel", icon: "⛅", temp: "28°C", desc: "Berawan" },
  { day: "Rab", icon: "☀️", temp: "30°C", desc: "Cerah" },
  { day: "Kam", icon: "☀️", temp: "29°C", desc: "Cerah" },
  { day: "Jum", icon: "⛅", temp: "27°C", desc: "Berawan" },
  { day: "Sab", icon: "🌧️", temp: "25°C", desc: "Hujan" },
  { day: "Min", icon: "🌧️", temp: "24°C", desc: "Hujan" },
];

export default function SmartPlantingPage() {
  const [region, setRegion] = useState("");
  const [commodity, setCommodity] = useState("");
  const [showRecommendation, setShowRecommendation] = useState(false);

  const handleGetRecommendation = () => {
    if (region && commodity) {
      setShowRecommendation(true);
    }
  };

  const recommendation = commodity
    ? plantingRecommendations[commodity as keyof typeof plantingRecommendations]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-emerald-100 rounded-xl">
          <Sprout className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Smart Planting Recommendation
          </h1>
          <p className="text-muted-foreground mt-1">
            Rekomendasi waktu tanam terbaik berbasis AI — analisis cuaca, tanah, dan kondisi lahan
          </p>
        </div>
      </div>

      {/* Input Section */}
      <Card className="bg-emerald-50 border-emerald-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <Sprout className="h-5 w-5 text-emerald-600" />
            Pilih Lokasi &amp; Komoditas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                Wilayah
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="region"
                  type="text"
                  placeholder="Contoh: Jawa Barat"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="bg-white pl-9 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commodity" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                Komoditas
              </Label>
              <Input
                id="commodity"
                type="text"
                placeholder="padi, jagung, kedelai"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value.toLowerCase())}
                className="bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGetRecommendation}
                disabled={!region || !commodity}
                size="lg"
                className={cn(
                  "w-full font-semibold transition-all duration-200",
                  "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                )}
              >
                <Sprout className="h-4 w-4 mr-2" />
                Dapatkan Rekomendasi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Forecast */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-blue-500" />
            Prakiraan Cuaca 7 Hari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {weatherForecast.map((forecast, i) => (
              <div
                key={forecast.day}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center p-4 rounded-xl border transition-all duration-200",
                  "bg-blue-50 border-blue-100 hover:border-blue-300 hover:shadow-sm min-w-[80px]",
                  i === 0 && "ring-2 ring-blue-400 ring-offset-1"
                )}
              >
                <p className="text-xs font-semibold text-gray-500 mb-2">{forecast.day}</p>
                <p className="text-3xl mb-2">{forecast.icon}</p>
                <p className="text-sm font-bold text-blue-700">{forecast.temp}</p>
                <p className="text-xs text-gray-500 mt-1">{forecast.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Result */}
      {showRecommendation && recommendation && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          <Card className="border-2 border-emerald-300 shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2 text-emerald-900">
                  <Sprout className="h-6 w-6 text-emerald-600" />
                  Rekomendasi Tanam untuk{" "}
                  <span className="capitalize">
                    {commodity === "rice" ? "Padi" : commodity === "corn" ? "Jagung" : "Kedelai"}
                  </span>
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium">
                  {region}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all duration-200">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Waktu Terbaik</p>
                    <p className="text-sm font-bold text-emerald-700 mt-1">{recommendation.bestTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all duration-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CloudRain className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kondisi Cuaca</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">{recommendation.weather}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-cyan-200 transition-all duration-200">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Droplets className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kondisi Tanah</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">{recommendation.soil}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 transition-all duration-200">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Thermometer className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tingkat Risiko</p>
                    <Badge className={cn("mt-2 text-xs font-semibold border", recommendation.riskVariant)}>
                      {recommendation.risk}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Tips Penting</p>
                    <p className="text-sm text-amber-700 mt-1 leading-relaxed">{recommendation.tips}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
