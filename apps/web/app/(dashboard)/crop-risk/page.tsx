"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Waves,
  Sun,
  Leaf,
  MapPin,
  TrendingUp,
  Bell,
  Shield,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy risk data
const riskData = [
  {
    type: "Banjir",
    level: "Tinggi",
    borderColor: "border-t-red-500",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    regions: ["Jakarta Utara", "Bekasi", "Tangerang"],
    icon: Waves,
    description: "Curah hujan tinggi dalam 7 hari terakhir menyebabkan potensi genangan.",
  },
  {
    type: "Kekeringan",
    level: "Sedang",
    borderColor: "border-t-yellow-500",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    regions: ["Jawa Tengah", "DI Yogyakarta"],
    icon: Sun,
    description: "Indeks kelembaban tanah di bawah normal akibat minimnya curah hujan.",
  },
  {
    type: "Penurunan Vegetasi",
    level: "Rendah",
    borderColor: "border-t-green-500",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    regions: ["Jawa Barat"],
    icon: Leaf,
    description: "NDVI menunjukkan penurunan minor pada beberapa area persawahan.",
  },
];

// Risk trend data
const riskTrends = [
  { label: "Banjir", value: 75, color: "bg-red-500", textColor: "text-red-600" },
  { label: "Kekeringan", value: 50, color: "bg-yellow-500", textColor: "text-yellow-600" },
  { label: "Penurunan Vegetasi", value: 25, color: "bg-green-500", textColor: "text-green-600" },
];

// Dummy alerts
const alerts = [
  {
    id: 1,
    message: "Potensi banjir di wilayah Jakarta dalam 3 hari ke depan",
    time: "2 jam yang lalu",
    severity: "high",
    icon: AlertTriangle,
  },
  {
    id: 2,
    message: "Indeks kekeringan meningkat di Jawa Tengah",
    time: "5 jam yang lalu",
    severity: "medium",
    icon: AlertTriangle,
  },
  {
    id: 3,
    message: "Kualitas vegetasi stabil di mayoritas wilayah",
    time: "1 hari yang lalu",
    severity: "low",
    icon: CheckCircle,
  },
];

const mapMarkers = [
  { label: "JKT", x: "30%", y: "45%", risk: "high" },
  { label: "JTG", x: "52%", y: "55%", risk: "medium" },
  { label: "JBR", x: "42%", y: "50%", risk: "low" },
  { label: "SBY", x: "65%", y: "50%", risk: "low" },
  { label: "MDN", x: "18%", y: "28%", risk: "medium" },
];

export default function CropRiskPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-100 rounded-xl">
          <Shield className="h-7 w-7 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Crop Risk Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitoring risiko pertanian berdasarkan data satelit dan cuaca real-time
          </p>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {riskData.map((risk) => {
          const Icon = risk.icon;
          return (
            <Card
              key={risk.type}
              className={cn(
                "border-t-4 shadow-sm hover:shadow-md transition-all duration-200",
                risk.borderColor
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", risk.iconBg)}>
                      <Icon className={cn("h-4 w-4", risk.iconColor)} />
                    </div>
                    <CardTitle className="text-sm font-semibold text-gray-800">
                      {risk.type}
                    </CardTitle>
                  </div>
                  <Badge className={cn("text-xs font-semibold border", risk.badgeClass)}>
                    {risk.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {risk.description}
                </p>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Wilayah terdampak:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {risk.regions.map((region) => (
                      <span
                        key={region}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200"
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Satellite Map Placeholder */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-slate-600" />
            Peta Risiko Satelit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-slate-800 rounded-xl overflow-hidden h-80 border border-slate-700">
            {/* Grid lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Subtle terrain blobs */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-[30%] left-[25%] w-48 h-32 bg-emerald-600 rounded-full blur-3xl" />
              <div className="absolute top-[40%] left-[45%] w-56 h-40 bg-emerald-700 rounded-full blur-3xl" />
              <div className="absolute top-[25%] left-[15%] w-32 h-24 bg-teal-600 rounded-full blur-2xl" />
            </div>

            {/* Indonesia label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <span className="text-slate-300 text-xs font-bold uppercase tracking-widest opacity-70">
                Indonesia
              </span>
            </div>

            {/* Map markers */}
            {mapMarkers.map((marker) => (
              <div
                key={marker.label}
                className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2"
                style={{ left: marker.x, top: marker.y }}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-white shadow-lg animate-pulse",
                    marker.risk === "high"
                      ? "bg-red-500"
                      : marker.risk === "medium"
                      ? "bg-yellow-400"
                      : "bg-green-400"
                  )}
                />
                <span className="text-white text-[9px] font-bold bg-black/40 px-1 rounded">
                  {marker.label}
                </span>
              </div>
            ))}

            {/* Legend */}
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm rounded-lg p-2.5 border border-slate-700">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-1.5">
                Legenda
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <span className="text-slate-300 text-[10px]">Tinggi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                  <span className="text-slate-300 text-[10px]">Sedang</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                  <span className="text-slate-300 text-[10px]">Rendah</span>
                </div>
              </div>
            </div>

            {/* Data source label */}
            <div className="absolute bottom-3 left-3">
              <span className="text-slate-500 text-[9px]">Sumber: Data NDVI &amp; Satelit</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Trends */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Tren Risiko 7 Hari Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {riskTrends.map((trend) => (
              <div key={trend.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{trend.label}</span>
                  <span className={cn("text-sm font-bold", trend.textColor)}>{trend.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      trend.color
                    )}
                    style={{ width: `${trend.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Notifikasi &amp; Peringatan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, i) => {
              const Icon = alert.icon;
              return (
                <React.Fragment key={alert.id}>
                  <div
                    className={cn(
                      "flex items-start justify-between p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-sm",
                      alert.severity === "high"
                        ? "bg-red-50 border-red-500 hover:bg-red-100/50"
                        : alert.severity === "medium"
                        ? "bg-yellow-50 border-yellow-500 hover:bg-yellow-100/50"
                        : "bg-green-50 border-green-500 hover:bg-green-100/50"
                    )}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <Icon
                        className={cn(
                          "h-4 w-4 mt-0.5 flex-shrink-0",
                          alert.severity === "high"
                            ? "text-red-600"
                            : alert.severity === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        )}
                      />
                      <p className="text-sm font-medium text-gray-800 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-3 mt-0.5">
                      {alert.time}
                    </span>
                  </div>
                  {i < alerts.length - 1 && <Separator />}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
