"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Data dummy
const dummyMenus = [
  { id: 1, name: "Nasi Ikan Kembung Sayur", status: "Pending SPPG" },
  { id: 2, name: "Gado-Gado Lengkap", status: "Pending SPPG" },
  { id: 3, name: "Ayam Geprek Sambal", status: "Disetujui SPPG" },
];

const wfqCandidates = [
  { name: "Catering Sehat Nusantara", distance: "5.1 km", kuota: 500, rating: 4.2, score: 69.48 },
  { name: "Dapur Bunda Sari", distance: "2.4 km", kuota: 300, rating: 4.6, score: 67.30 },
  { name: "Warung Makan Sederhana", distance: "8.2 km", kuota: 200, rating: 3.9, score: 55.20 },
];

export default function SPPGPage() {
  const [selectedMenu, setSelectedMenu] = useState("");
  const [jumlahPorsi, setJumlahPorsi] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");

  const handleCreateOrder = () => {
    toast.success("Order berhasil dibuat dengan WFQ!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard SPPG</h1>

      {/* Tabel Verifikasi Menu */}
      <Card>
        <CardHeader>
          <CardTitle>Verifikasi Menu (Tahap 1)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Menu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyMenus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell>
                    <Badge variant={menu.status.includes("Pending") ? "secondary" : "default"}>
                      {menu.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Tinjau
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Buat Order Baru dengan WFQ */}
      <Card>
        <CardHeader>
          <CardTitle>Buat Order Baru (WFQ)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Menu</Label>
              <Select value={selectedMenu} onValueChange={setSelectedMenu}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih menu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nasi-ikan">Nasi Ikan Kembung Sayur</SelectItem>
                  <SelectItem value="gado-gado">Gado-Gado Lengkap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jumlah Porsi</Label>
              <Input
                type="number"
                placeholder="100"
                value={jumlahPorsi}
                onChange={(e) => setJumlahPorsi(e.target.value)}
              />
            </div>
            <div>
              <Label>Sekolah Tujuan</Label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sekolah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sdn-01">SDN 01 Menteng</SelectItem>
                  <SelectItem value="sdn-02">SDN 02 Menteng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* WFQ Simulation */}
          <div className="mt-6 border rounded-lg p-4 bg-slate-50">
            <h4 className="font-semibold mb-3">Simulasi Pemilihan UMKM (WFQ)</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Bobot: Jarak (30%) · Kuota (30%) · Rating (40%)
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>UMKM</TableHead>
                  <TableHead>Jarak</TableHead>
                  <TableHead>Kuota</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Skor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wfqCandidates.map((candidate, index) => (
                  <TableRow key={index} className={index === 0 ? "bg-emerald-50" : ""}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.distance}</TableCell>
                    <TableCell>{candidate.kuota}</TableCell>
                    <TableCell>{candidate.rating}</TableCell>
                    <TableCell className="text-right font-bold">
                      {candidate.score}
                      {index === 0 && <Badge className="ml-2 bg-emerald-600">Winner</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateOrder}>
              Kirim Order ke {wfqCandidates[0].name}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}