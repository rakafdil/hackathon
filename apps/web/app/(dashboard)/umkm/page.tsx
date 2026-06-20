"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Utensils, Star, Package } from "lucide-react";

// Data dummy (nanti diganti dengan API)
const dummyMenus = [
  { id: 1, name: "Nasi Ikan Kembung Sayur", status: "Disetujui", rating: 4.5 },
  { id: 2, name: "Gado-Gado Lengkap", status: "Perlu Revisi", rating: 3.8 },
  { id: 3, name: "Ayam Geprek Sambal", status: "Ditolak", rating: 2.0 },
];

export default function UMKMPage() {
  const [open, setOpen] = useState(false);
  const [menuName, setMenuName] = useState("");
  const [description, setDescription] = useState("");
  const [aiScore, setAiScore] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulasi skor AI
    const score = Math.floor(Math.random() * 30) + 70; // 70-100
    setAiScore(score);
    toast.success(`Menu berhasil diusulkan! Skor Gizi: ${score}/100`);
    setOpen(false);
    setMenuName("");
    setDescription("");
    setAiScore(null);
  };

  const stats = [
    { title: "Total Menu Aktif", value: "12", icon: Utensils },
    { title: "Rating Rata-rata", value: "4.2 ★", icon: Star },
    { title: "Sisa Kuota", value: "180 porsi", icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard UMKM</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" /> Usulkan Menu Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Usulkan Menu Baru</DialogTitle>
              <DialogDescription>
                Isi detail menu yang akan diajukan. AI akan menskrining kelayakan gizi.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="menuName">Nama Menu</Label>
                  <Input
                    id="menuName"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    placeholder="Contoh: Nasi Ikan Kembung Sayur"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi Bahan</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nasi 100g, Ikan Kembung 50g, Sayur 30g"
                    required
                  />
                </div>
                {aiScore !== null && (
                  <div className="rounded-md bg-slate-50 p-3 text-sm">
                    <span className="font-medium">Skor Gizi AI: </span>
                    <span className="text-emerald-600">{aiScore}/100</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {aiScore >= 80 ? "(Layak diverifikasi)" : "(Perlu perbaikan)"}
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Kirim Usulan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabel Menu */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Saya</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Menu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyMenus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell className="font-medium">{menu.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        menu.status === "Disetujui"
                          ? "default"
                          : menu.status === "Perlu Revisi"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {menu.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{menu.rating} ★</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}