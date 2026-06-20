"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Sprout,
  AlertTriangle,
  TrendingUp,
  Bot,
  CloudSun,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
  Clock,
  Target,
  Award,
  Users,
  ChevronRight,
  BarChart3,
  PieChart,
  Droplets,
  Wind,
  Thermometer,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ─────────────────────────────────────────────────── */

const stats = [
  {
    title: "Lahan Aktif",
    value: "24",
    icon: Sprout,
    change: "+3 dari minggu lalu",
    changeVal: "+3",
    trend: "up" as const,
    accent: "emerald",
    description: "Dari total 30 lahan",
    progress: 78,
  },
  {
    title: "Risk Alerts",
    value: "3",
    icon: AlertTriangle,
    change: "-2 dari kemarin",
    changeVal: "-2",
    trend: "down" as const,
    accent: "red",
    description: "Tingkat risiko rendah",
    progress: 15,
  },
  {
    title: "Komoditas Dipantau",
    value: "18",
    icon: TrendingUp,
    change: "+5 komoditas baru",
    changeVal: "+5",
    trend: "up" as const,
    accent: "blue",
    description: "Target 20 komoditas",
    progress: 85,
  },
  {
    title: "AI Queries",
    value: "156",
    icon: Bot,
    change: "+23% dari rata-rata",
    changeVal: "+23%",
    trend: "up" as const,
    accent: "purple",
    description: "Dari kapasitas 240/hari",
    progress: 65,
  },
];

type AccentStyle = { bar: string; icon: string; badge: string; text: string; bg: string; ring: string };

const accentMap: Record<string, AccentStyle> = {
  emerald: {
    bar: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
  },
  red: {
    bar: "bg-red-500",
    icon: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700 border-red-200",
    text: "text-red-600",
    bg: "bg-red-50",
    ring: "ring-red-100",
  },
  blue: {
    bar: "bg-blue-500",
    icon: "bg-blue-50 text-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    text: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-100",
  },
  purple: {
    bar: "bg-purple-500",
    icon: "bg-purple-50 text-purple-600",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    text: "text-purple-600",
    bg: "bg-purple-50",
    ring: "ring-purple-100",
  },
};

const recentActivities = [
  { id: 1, title: "Rekomendasi tanam padi diperbarui", time: "5 menit lalu", type: "success" },
  { id: 2, title: "Alert kekeringan di Jawa Tengah", time: "15 menit lalu", type: "warning" },
  { id: 3, title: "Harga beras di Jakarta naik 5%", time: "1 jam lalu", type: "info" },
  { id: 4, title: "Prediksi cuaca 7 hari tersedia", time: "2 jam lalu", type: "info" },
  { id: 5, title: "Laporan produksi bulanan selesai", time: "3 jam lalu", type: "success" },
];

const aiInsights = [
  {
    icon: Sprout,
    accent: "emerald",
    title: "Waktu Tanam Optimal",
    body: "3 hari ke depan adalah waktu terbaik untuk menanam padi di Jawa Barat",
  },
  {
    icon: AlertTriangle,
    accent: "red",
    title: "Peringatan Kekeringan",
    body: "Indeks kelembaban tanah di Jawa Tengah turun 15% dari kondisi normal",
  },
  {
    icon: TrendingUp,
    accent: "blue",
    title: "Tren Harga Naik",
    body: "Harga beras premium naik 5% di Jakarta dalam 7 hari terakhir",
  },
];

const quickActions = [
  {
    title: "Smart Planting",
    description: "Rekomendasi tanam berbasis data cuaca & tanah",
    icon: Sprout,
    href: "/smart-planting",
    accent: "emerald",
  },
  {
    title: "Crop Risk",
    description: "Pantau dan mitigasi risiko lahan real-time",
    icon: AlertTriangle,
    href: "/crop-risk",
    accent: "red",
  },
  {
    title: "Price Intelligence",
    description: "Analisis dan prediksi harga komoditas",
    icon: TrendingUp,
    href: "/prices",
    accent: "blue",
  },
  {
    title: "AI Assistant",
    description: "Konsultasi langsung dengan AI agronomist",
    icon: Bot,
    href: "/ai-assistant",
    accent: "purple",
  },
];

const quickActionTopColors: Record<string, string> = {
  emerald: "from-emerald-500 to-emerald-400",
  red: "from-red-500 to-orange-400",
  blue: "from-blue-500 to-cyan-400",
  purple: "from-purple-500 to-pink-400",
};

const commodities = [
  { name: "Padi", value: 92, color: "bg-emerald-500" },
  { name: "Jagung", value: 78, color: "bg-yellow-500" },
  { name: "Kedelai", value: 65, color: "bg-blue-500" },
  { name: "Tebu", value: 54, color: "bg-purple-500" },
];

const productionTargets = [
  { name: "Beras", target: "50 ton", progress: 72, color: "bg-emerald-500" },
  { name: "Jagung", target: "30 ton", progress: 58, color: "bg-yellow-500" },
  { name: "Kedelai", target: "20 ton", progress: 85, color: "bg-blue-500" },
];

const defaultAccent: AccentStyle = accentMap["emerald"]!;
const getAccent = (key: string): AccentStyle => accentMap[key] ?? defaultAccent;

/* ─── Component ─────────────────────────────────────────────── */

export default function DashboardPage() {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
  }, []);

  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {greeting}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Berikut ringkasan aktivitas pertanian Anda hari ini
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 border-gray-200"
          >
            <Calendar className="h-3 w-3" />
            {dateStr}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 border-gray-200"
          >
            <MapPin className="h-3 w-3" />
            Indonesia
          </Badge>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const a = getAccent(stat.accent);
          return (
            <Card
              key={stat.title}
              className="relative overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-gray-100"
            >
              {/* Left color bar */}
              <span className={cn("absolute left-0 top-0 h-full w-1 rounded-r-sm", a.bar)} />

              <CardContent className="pt-5 pb-4 pl-5 pr-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className={cn("text-3xl font-bold mt-1 leading-none", a.text)}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", a.bg)}>
                    <Icon className={cn("h-4.5 w-4.5", a.text.replace("text-", "text-"))} />
                  </div>
                </div>

                <Progress value={stat.progress} className="h-1.5 mb-2.5" />

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{stat.description}</p>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-[11px] font-semibold",
                      stat.trend === "up" ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.changeVal}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Weather Banner ─────────────────────────────── */}
      <Card className="bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 border-sky-100 shadow-sm overflow-hidden">
        <CardContent className="py-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                <CloudSun className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Cuaca Hari Ini</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  Jakarta, Indonesia
                </p>
              </div>
            </div>

            {/* Center */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-sky-600 leading-none">28°C</span>
              <span className="text-sm text-gray-500">Cerah Berawan</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Droplets className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400 leading-none">Kelembaban</p>
                  <p className="font-semibold text-gray-800">72%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wind className="h-4 w-4 text-teal-400" />
                <div>
                  <p className="text-xs text-gray-400 leading-none">Angin</p>
                  <p className="font-semibold text-gray-800">12 km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Thermometer className="h-4 w-4 text-orange-400" />
                <div>
                  <p className="text-xs text-gray-400 leading-none">Terasa</p>
                  <p className="font-semibold text-gray-800">30°C</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Actions ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Akses Cepat</h2>
          <Button variant="ghost" size="sm" className="text-xs text-emerald-600 h-7 px-2">
            Lihat Semua
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const a = getAccent(action.accent);
            const topGrad = quickActionTopColors[action.accent] ?? "from-emerald-500 to-emerald-400";
            return (
              <Link key={action.title} href={action.href} className="group">
                <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer bg-white h-full">
                  {/* Top accent bar */}
                  <div className={cn("h-1 w-full bg-gradient-to-r", topGrad)} />
                  <CardContent className="pt-4 pb-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl mb-3 transition-transform duration-200 group-hover:scale-110",
                        a.bg
                      )}
                    >
                      <Icon className={cn("h-5 w-5", a.text)} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{action.description}</p>
                    <div
                      className={cn(
                        "mt-3 flex items-center gap-1 text-xs font-semibold transition-gap duration-150",
                        a.text
                      )}
                    >
                      Buka Fitur
                      <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* ── Activity & Insights ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <Card className="border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Aktivitas Terbaru</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Update real-time dari sistem</CardDescription>
                </div>
              </div>
              <Clock className="h-3.5 w-3.5 text-gray-300" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {/* Timeline dot */}
                  <div className="mt-1 shrink-0 relative">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        activity.type === "success"
                          ? "bg-emerald-500"
                          : activity.type === "warning"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 group-hover:text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-gray-100 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Insights</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Rekomendasi berdasarkan analisis AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5">
            {aiInsights.map((ins) => {
              const Icon = ins.icon;
              const a = getAccent(ins.accent);
              return (
                <div
                  key={ins.title}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all duration-150 hover:shadow-sm",
                    a.bg,
                    a.badge.split(" ").find((c) => c.startsWith("border-"))
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm group-hover:scale-105 transition-transform"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", a.text)} />
                  </div>
                  <div>
                    <p className={cn("text-xs font-semibold", a.text)}>{ins.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{ins.body}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs Section ────────────────────────────────── */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="h-9 bg-gray-100/80 p-1">
          <TabsTrigger value="overview" className="h-7 text-xs">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="h-7 text-xs">
            <PieChart className="h-3.5 w-3.5 mr-1.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="h-7 text-xs">
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  Ringkasan Komoditas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {commodities.map((c) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{c.name}</span>
                      <span className="text-gray-500 font-semibold">{c.value}%</span>
                    </div>
                    <Progress value={c.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Target Produksi Bulan Ini
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {productionTargets.map((item) => (
                  <div key={item.name} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                      <span className="text-[11px] text-gray-500">Target: {item.target}</span>
                    </div>
                    <Progress value={item.progress} className="h-1.5 mb-1" />
                    <p className="text-[11px] text-gray-400">{item.progress}% tercapai</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  Top Komoditas
                </CardTitle>
                <CardDescription className="text-xs">Berdasarkan produktivitas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {commodities.map((c) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{c.name}</span>
                      <span className="font-semibold text-gray-800">{c.value}%</span>
                    </div>
                    <Progress value={c.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Target Produksi
                </CardTitle>
                <CardDescription className="text-xs">Progress bulanan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {productionTargets.map((item) => (
                  <div key={item.name} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-800">{item.name}</span>
                      <span className="text-[11px] text-gray-500">Target: {item.target}</span>
                    </div>
                    <Progress value={item.progress} className="h-1.5 mb-1" />
                    <p className="text-[11px] text-gray-400">{item.progress}% tercapai</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Laporan Aktivitas Pengguna
              </CardTitle>
              <CardDescription className="text-xs">Statistik penggunaan platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Total Petani", value: "1,248", icon: Users, accent: "emerald", badge: "+12% bulan ini" },
                  { label: "AI Queries", value: "3,456", icon: BarChart3, accent: "blue", badge: "+23% dari rata-rata" },
                  { label: "Kepuasan User", value: "98%", icon: Award, accent: "purple", badge: "Sangat Baik" },
                ].map((item) => {
                  const Icon = item.icon;
                  const a = getAccent(item.accent);
                  return (
                    <div
                      key={item.label}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border p-5 text-center",
                        a.bg,
                        a.badge.split(" ").find((c) => c.startsWith("border-"))
                      )}
                    >
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm mb-3")}>
                        <Icon className={cn("h-5 w-5", a.text)} />
                      </div>
                      <p className={cn("text-2xl font-bold", a.text)}>{item.value}</p>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">{item.label}</p>
                      <Badge className={cn("mt-2 text-[10px] border", a.badge)}>{item.badge}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
