"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Sprout,
  AlertTriangle,
  TrendingUp,
  Bot,
  LogOut,
  Menu,
  Leaf,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Smart Planting", href: "/smart-planting", icon: Sprout },
  { name: "Crop Risk", href: "/crop-risk", icon: AlertTriangle },
  { name: "Price Intelligence", href: "/prices", icon: TrendingUp },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/smart-planting": "Smart Planting",
  "/crop-risk": "Crop Risk",
  "/prices": "Price Intelligence",
  "/ai-assistant": "AI Assistant",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/login");
    }
  };

  const currentTitle = pageTitles[pathname] ?? "AgriNexus";

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-200">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-tight text-gray-900 leading-none">
            AgriNexus
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 tracking-wide uppercase">
            Smart Farming
          </p>
        </div>
      </div>

      <Separator className="mx-4 mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNav}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {/* Active left indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-emerald-600" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <span className="flex-1 truncate">{item.name}</span>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="mt-auto px-3 pb-5 pt-3 space-y-2">
        <Separator className="mb-3" />
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-none">User</p>
            <p className="text-xs text-gray-400 mt-0.5">Petani</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            onClick={handleLogout}
            title="Keluar"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-100 bg-white shadow-[1px_0_0_0_#f3f4f6]">
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-100 bg-white px-4 md:px-6">
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-gray-500"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent onNav={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb title */}
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="text-gray-900 font-semibold">{currentTitle}</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Cari fitur, komoditas, lokasi..."
                className="pl-9 h-9 bg-gray-50 border-gray-200 rounded-full text-sm focus:bg-white focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Notification */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                3
              </span>
            </Button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-emerald-300 transition-all">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">User</p>
                <p className="text-xs text-gray-400 mt-0.5">Petani</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}