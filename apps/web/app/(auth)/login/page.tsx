"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Quote,
} from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Login gagal");
      }

      // Token is automatically stored in httpOnly cookie by backend
      toast.success("Login berhasil!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Email atau password salah");
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

        {/* Scattered leaf decorations */}
        <Leaf className="absolute top-24 right-[18%] w-10 h-10 text-emerald-200/40 rotate-[-12deg] animate-float" />
        <Leaf className="absolute top-[38%] right-[8%] w-7 h-7 text-emerald-100/30 rotate-[25deg] animate-float-slow animation-delay-300" />
        <Leaf className="absolute bottom-[28%] right-[22%] w-12 h-12 text-emerald-200/35 rotate-[-25deg] animate-float animation-delay-500" />
        <Leaf className="absolute bottom-[18%] left-[12%] w-8 h-8 text-emerald-100/25 rotate-[18deg] animate-float-slow animation-delay-700" />

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
            Platform Kedaulatan Pangan Berbasis Data & AI
          </h1>
          <p className="text-emerald-50/90 text-lg leading-relaxed">
            Kelola pertanian Anda dengan lebih cerdas, mulai dari prediksi harga, risiko tanaman, hingga rekomendasi AI.
          </p>
        </div>

        {/* Bottom testimonial */}
        <div className="relative z-10 animate-slide-up animation-delay-500">
          <div className="glass-dark rounded-2xl p-6 max-w-sm ring-1 ring-white/10">
            <Quote className="h-6 w-6 text-emerald-300 mb-3" />
            <p className="text-sm leading-relaxed text-emerald-50/95 mb-4">
              “AgriNexus membantu kami meningkatkan hasil panen sebesar 30% dalam satu musim berkat prediksi cuaca dan rekomendasi tanam yang akurat.”
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-200/30 flex items-center justify-center text-sm font-semibold text-white">
                RP
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pak Rudi</p>
                <p className="text-xs text-emerald-100/70">Petani Padi, Jawa Barat</p>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang</h2>
            <p className="text-slate-500">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0"
                />
                <Label htmlFor="remember" className="text-sm text-slate-600 font-normal cursor-pointer">
                  Ingat saya
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-12 text-base rounded-xl btn-emerald",
                loading && "opacity-80 cursor-not-allowed"
              )}
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 px-2 text-slate-400">atau</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            <GoogleIcon className="mr-2 h-5 w-5 text-emerald-600" />
            Masuk dengan Google
          </Button>

          <p className="mt-8 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
