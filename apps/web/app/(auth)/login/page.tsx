"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { T } from "@/lib/design-tokens";
import { CONFIG } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulasi async — ganti dengan fetch/API call sesungguhnya
    setTimeout(() => {
      setLoading(false);
      if (password === "demo") {
        router.push("/overview");
      } else {
        setError('Username atau password salah. (hint: gunakan password "demo")');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-sm flex-shrink-0" style={{ background: T.primary }} />
          <span className="font-mono font-black text-foreground text-xl tracking-tight">
            {CONFIG.appName}
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-mono font-black text-foreground text-2xl tracking-tight mb-1">Masuk</h1>
          <p className="font-sans text-sm text-muted-foreground">{CONFIG.appTagline}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase block mb-1.5">
              Username
            </label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                autoComplete="username"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-secondary border border-border pl-9 pr-4 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 rounded-sm transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary border border-border pl-9 pr-10 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 rounded-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 p-3 border rounded-sm text-xs font-sans"
              style={{ borderColor: `${T.danger}30`, background: `${T.danger}08`, color: T.danger }}
            >
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 font-mono text-sm tracking-wider rounded-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: T.primary, color: "var(--primary-foreground)" }}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Memverifikasi...
              </>
            ) : "Masuk"}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-8 p-4 border border-dashed border-border rounded-sm">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mb-2">
            Demo credentials
          </p>
          <p className="font-sans text-xs text-muted-foreground">
            Username: <span className="font-mono text-foreground">siapapun</span>
            {" · "}
            Password: <span className="font-mono text-foreground">demo</span>
          </p>
        </div>
      </div>
    </div>
  );
}
