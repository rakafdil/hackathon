"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Leaf,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sprout,
  Quote,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("farmer");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Anda harus menyetujui syarat & ketentuan");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName, email, password, role }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registrasi gagal");
      }

      const data = await res.json();
      toast.success("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Left Branding Panel */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-[45%] flex-col justify-between p-10 lg:p-14 gradient-emerald-radial text-white overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-teal-300/15 blur-3xl animate-pulse-soft animation-delay-700" />
        <div className="absolute -bottom-32 right-12 w-96 h-96 rounded-full bg-emerald-300/10 blur-3xl animate-pulse-soft animation-delay-1000" />

        {/* Scattered plant decorations */}
        <Sprout className="absolute top-24 right-[16%] w-11 h-11 text-emerald-200/40 rotate-[-12deg] animate-float" />
        <Leaf className="absolute top-[36%] right-[10%] w-7 h-7 text-emerald-100/30 rotate-[22deg] animate-float-slow animation-delay-300" />
        <Sprout className="absolute bottom-[30%] right-[24%] w-12 h-12 text-emerald-200/35 rotate-[15deg] animate-float animation-delay-500" />
        <Leaf className="absolute bottom-[20%] left-[10%] w-9 h-9 text-emerald-100/25 rotate-[-20deg] animate-float-slow animation-delay-700" />

        {/* Top branding */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-in">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">AgriNexus</span>
        </div>

        {/* Center tagline */}
        <div className="relative z-10 max-w-md animate-slide-up animation-delay-200">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-6">
            Jadilah Bagian dari Revolusi Pertanian Digital
          </h1>
          <p className="text-emerald-50/90 text-lg leading-relaxed">
            Bergabung dengan ribuan petani, distributor, dan pemangku kepentingan untuk membangun ketahanan pangan nasional.
          </p>
        </div>

        {/* Bottom testimonial */}
        <div className="relative z-10 animate-slide-up animation-delay-500">
          <div className="glass-dark rounded-2xl p-6 max-w-sm ring-1 ring-white/10">
            <Quote className="h-6 w-6 text-emerald-300 mb-3" />
            <p className="text-sm leading-relaxed text-emerald-50/95 mb-4">
              “Dengan AgriNexus, saya bisa memantau harga komoditas real-time dan menjual hasil panen ke distributor terdekat lebih cepat.”
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-200/30 flex items-center justify-center text-sm font-semibold text-white">
                AS
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Bu Asih</p>
                <p className="text-xs text-emerald-100/70">Petani Sayur, Jawa Tengah</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10 lg:p-16 bg-slate-50/50">
        <div className="w-full max-w-md animate-slide-in-right">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-emerald-900">AgriNexus</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Buat Akun Baru</h2>
            <p className="text-slate-500">Bergabung dengan AgriNexus</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700 font-medium">
                Nama Lengkap
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12 pl-10 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-10 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-10 pr-10 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 pl-10 pr-10 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700 font-medium">
                Peran
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-12 bg-white border-slate-200 focus:ring-emerald-500/20 focus:ring-offset-0">
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Petani</SelectItem>
                  <SelectItem value="buyer">Pembeli/Distributor</SelectItem>
                  <SelectItem value="government">Pemerintah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0"
              />
              <Label htmlFor="terms" className="text-sm text-slate-600 font-normal cursor-pointer leading-relaxed">
                Saya setuju dengan{" "}
                <Link href="/terms" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                  syarat & ketentuan
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-12 text-base rounded-xl btn-emerald",
                loading && "opacity-80 cursor-not-allowed"
              )}
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
