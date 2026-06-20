"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
 const router = useRouter();
 const [fullName, setFullName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
   toast.error("Password dan konfirmasi password tidak cocok");
   return;
  }

  setLoading(true);

  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password }),
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
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
   <Card className="w-full max-w-md">
    <CardHeader>
     <CardTitle className="text-2xl text-center">Daftar Akun</CardTitle>
     <p className="text-sm text-muted-foreground text-center">
      Buat akun baru untuk bergabung dengan SinergiBoga
     </p>
    </CardHeader>
    <CardContent>
     <form onSubmit={handleSubmit} className="space-y-4">
      <div>
       <Label htmlFor="fullName">Nama Lengkap</Label>
       <Input
        id="fullName"
        type="text"
        placeholder="Nama Lengkap"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
       />
      </div>
      <div>
       <Label htmlFor="email">Email</Label>
       <Input
        id="email"
        type="email"
        placeholder="nama@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
       />
      </div>
      <div>
       <Label htmlFor="password">Password</Label>
       <Input
        id="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
       />
      </div>
      <div>
       <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
       <Input
        id="confirmPassword"
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
       />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
       {loading ? "Memproses..." : "Daftar"}
      </Button>
     </form>
     <p className="text-sm text-center mt-4">
      Sudah punya akun?{" "}
      <Link href="/login" className="text-emerald-600 hover:underline">
       Masuk di sini
      </Link>
     </p>
    </CardContent>
   </Card>
  </div>
 );
}
