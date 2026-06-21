"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Utensils,
  ClipboardCheck,
  Truck,
  School,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "UMKM", href: "/dashboard/umkm", icon: Users },
  { name: "SPPG", href: "/dashboard/sppg", icon: ClipboardCheck },
  { name: "Ahli Gizi", href: "/dashboard/ahli-gizi", icon: Utensils },
  { name: "Sekolah", href: "/dashboard/sekolah", icon: School },
  { name: "Pengemudi", href: "/dashboard/pengemudi", icon: Truck },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-emerald-600">SinergiBoga</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "hover:bg-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <Button
          variant="ghost"
          className="justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="mb-8 mt-4">
                <h1 className="text-2xl font-bold text-emerald-600">
                  SinergiBoga
                </h1>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </nav>
            </SheetContent>
          </Sheet>
          <span className="ml-2 font-semibold">SinergiBoga</span>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
