"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  ShoppingCart,
  AlertCircle,
  DollarSign,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy price data
const priceData = [
  { commodity: "Beras Premium", jakarta: 14500, surabaya: 13800, medan: 15200, semarang: 14000 },
  { commodity: "Jagung", jakarta: 5500, surabaya: 5200, medan: 5800, semarang: 5300 },
  { commodity: "Kedelai", jakarta: 11000, surabaya: 10500, medan: 11500, semarang: 10800 },
  { commodity: "Gula Pasir", jakarta: 16500, surabaya: 16200, medan: 17000, semarang: 16300 },
  { commodity: "Minyak Goreng", jakarta: 18500, surabaya: 18000, medan: 19000, semarang: 18200 },
];

// Dummy anomalies
const anomalies = [
  {
    id: 1,
    commodity: "Beras Premium",
    region: "Medan",
    currentPrice: 15200,
    avgPrice: 14200,
    deviation: "+7%",
    severity: "high",
  },
  {
    id: 2,
    commodity: "Minyak Goreng",
    region: "Medan",
    currentPrice: 19000,
    avgPrice: 18200,
    deviation: "+4.4%",
    severity: "medium",
  },
];

// Supply predictions
const supplyPredictions = [
  { region: "Jawa Barat", commodity: "Beras", prediction: "+12%", trend: "up", recommendation: "Wilayah pembelian optimal" },
  { region: "Jawa Tengah", commodity: "Jagung", prediction: "+8%", trend: "up", recommendation: "Wilayah pembelian optimal" },
  { region: "Jawa Timur", commodity: "Kedelai", prediction: "-5%", trend: "down", recommendation: "Pertimbangkan wilayah lain" },
  { region: "Sumatera Utara", commodity: "Gula", prediction: "+3%", trend: "up", recommendation: "Wilayah pembelian optimal" },
];

// Best buying recommendations
const bestBuying = [
  { commodity: "Beras", city: "Surabaya", price: "Rp 13.800/kg", savings: "Hemat 4.8%" },
  { commodity: "Jagung", city: "Surabaya", price: "Rp 5.200/kg", savings: "Hemat 5.5%" },
  { commodity: "Kedelai", city: "Surabaya", price: "Rp 10.500/kg", savings: "Hemat 4.5%" },
  { commodity: "Minyak Goreng", city: "Surabaya", price: "Rp 18.000/kg", savings: "Hemat 2.7%" },
];

export default function PriceIntelligencePage() {
  const getBestPrice = (row: (typeof priceData)[0]) => {
    const prices = [
      { city: "Jakarta", price: row.jakarta },
      { city: "Surabaya", price: row.surabaya },
      { city: "Medan", price: row.medan },
      { city: "Semarang", price: row.semarang },
    ];
    return prices.reduce((min, curr) => (curr.price < min.price ? curr : min));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-emerald-100 rounded-xl">
          <TrendingUp className="h-7 w-7 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Regional Price Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Analisis harga komoditas antarwilayah dan deteksi anomali harga real-time
          </p>
        </div>
      </div>

      {/* Price Comparison Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Perbandingan Harga Regional (per kg)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50 hover:bg-emerald-50">
                <TableHead className="font-semibold text-emerald-900 pl-6">Komoditas</TableHead>
                <TableHead className="font-semibold text-emerald-900">Jakarta</TableHead>
                <TableHead className="font-semibold text-emerald-900">Surabaya</TableHead>
                <TableHead className="font-semibold text-emerald-900">Medan</TableHead>
                <TableHead className="font-semibold text-emerald-900">Semarang</TableHead>
                <TableHead className="font-semibold text-emerald-900">Termurah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceData.map((row, index) => {
                const best = getBestPrice(row);
                return (
                  <TableRow
                    key={index}
                    className={cn(
                      "transition-colors duration-150 hover:bg-emerald-50/40",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                    )}
                  >
                    <TableCell className="font-semibold text-gray-800 pl-6">
                      {row.commodity}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      Rp {row.jakarta.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      Rp {row.surabaya.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      Rp {row.medan.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      Rp {row.semarang.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 border border-green-200 font-medium text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {best.city}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Price Anomalies */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Deteksi Anomali Harga
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={cn(
                  "flex items-start justify-between p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-sm",
                  anomaly.severity === "high"
                    ? "bg-red-50 border-red-500 hover:bg-red-100/40"
                    : "bg-yellow-50 border-yellow-500 hover:bg-yellow-100/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg",
                      anomaly.severity === "high" ? "bg-red-100" : "bg-yellow-100"
                    )}
                  >
                    <TrendingUp
                      className={cn(
                        "h-4 w-4",
                        anomaly.severity === "high" ? "text-red-600" : "text-yellow-600"
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {anomaly.commodity}{" "}
                      <span className="font-normal text-gray-500">di {anomaly.region}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Harga saat ini:{" "}
                      <span className="font-medium text-gray-700">
                        Rp {anomaly.currentPrice.toLocaleString("id-ID")}
                      </span>{" "}
                      &bull; Rata-rata:{" "}
                      <span className="font-medium text-gray-700">
                        Rp {anomaly.avgPrice.toLocaleString("id-ID")}
                      </span>
                    </p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    "text-xs font-bold border ml-3 shrink-0",
                    anomaly.severity === "high"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  )}
                >
                  {anomaly.deviation}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supply Predictions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Prediksi Supply Panen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700 pl-6">Wilayah</TableHead>
                <TableHead className="font-semibold text-gray-700">Komoditas</TableHead>
                <TableHead className="font-semibold text-gray-700">Prediksi</TableHead>
                <TableHead className="font-semibold text-gray-700">Rekomendasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplyPredictions.map((item, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "transition-colors duration-150 hover:bg-gray-50",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  )}
                >
                  <TableCell className="font-medium text-gray-800 pl-6">{item.region}</TableCell>
                  <TableCell className="text-gray-600">{item.commodity}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-xs font-semibold border",
                        item.trend === "up"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      )}
                    >
                      {item.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {item.prediction}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{item.recommendation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Best Buying Recommendations */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 pb-4 pt-5">
          <CardTitle className="flex items-center gap-2 text-white">
            <Tag className="h-5 w-5" />
            Rekomendasi Wilayah Pembelian Terbaik
          </CardTitle>
          <p className="text-emerald-100 text-sm mt-1">
            Pilihan kota dengan harga paling kompetitif saat ini
          </p>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestBuying.map((item, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all duration-200"
              >
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  {item.commodity}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold text-emerald-600 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {item.city}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.price}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border border-green-200 font-semibold text-xs">
                    {item.savings}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
