"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Store,
  Users,
  Star,
  TrendingUp,
  Tag,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import Logo from "@/components/brand/Logo";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on onboarding page, render full width without sidebar
  if (pathname.includes("/seller/onboarding")) {
    return <div className="min-h-screen bg-slate-50 font-sans">{children}</div>;
  }

  const navItems = [
    { label: "Dashboard", href: "/seller", icon: LayoutDashboard, exact: true },
    { label: "Products", href: "/seller/products", icon: Package },
    { label: "Orders", href: "/seller/orders", icon: ShoppingBag },
    { label: "Inventory", href: "/seller/products", icon: Layers },
    { label: "Store", href: "/seller/store", icon: Store },
    { label: "Customers", href: "/seller/customers", icon: Users },
    { label: "Reviews", href: "/seller/reviews", icon: Star },
    { label: "Analytics", href: "/seller/analytics", icon: TrendingUp },
    { label: "Promotions", href: "/seller/promotions", icon: Tag },
    { label: "Settings", href: "/seller/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-900">
      {/* DESKTOP SIDEBAR (Fixed in viewport when scrolling pages) */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-900 text-slate-300 border-r border-dark-800 shrink-0 select-none fixed top-0 left-0 bottom-0 z-40 h-screen">
        {/* Logo Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-dark-800/80">
          <Logo variant="dark" size="md" href="/seller" showTagline={false} />
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500 text-dark-950 font-black shadow-glow"
                    : "text-slate-400 hover:text-white hover:bg-dark-800"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Store Context */}
        <div className="p-4 border-t border-dark-800/80 bg-dark-950/50">
          <Link
            href="/"
            className="flex items-center justify-between text-xs font-bold text-slate-400 hover:text-amber-400 transition"
          >
            <span>Customer Market</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-dark-900 text-slate-300 flex flex-col h-full z-10 shadow-2xl">
            <div className="h-16 px-6 flex items-center justify-between border-b border-dark-800">
              <Logo variant="dark" size="sm" href="/seller" />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                      isActive
                        ? "bg-amber-500 text-dark-950 font-black shadow-glow"
                        : "text-slate-400 hover:text-white hover:bg-dark-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          {/* Mobile hamburger + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Seller Hub
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-black text-slate-800 capitalize">
                {pathname.split("/").filter(Boolean)[1] || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Top Search & Profile Actions matching UI Reference */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search orders, products..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            {/* Merchant Dropdown */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                M
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">NorthMarket Seller</p>
                <p className="text-[10px] text-slate-400">Tamale Metropolis</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
