"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Star,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Store,
  Loader2,
} from "lucide-react";

interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  role: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {}
  };

  const menuSections = [
    {
      title: "My Activity",
      items: [
        { label: "My Orders", icon: Package, href: "/orders", badge: "Live Tracking" },
        { label: "Wishlist", icon: Heart, href: "/wishlist" },
        { label: "Saved Addresses", icon: MapPin, href: "/checkout" },
        { label: "Payment Methods", icon: CreditCard, href: "/checkout" },
      ],
    },
    {
      title: "Community & Preferences",
      items: [
        { label: "Notifications", icon: Bell, href: "/orders" },
        { label: "My Reviews", icon: Star, href: "/orders" },
        { label: "Help & Support", icon: HelpCircle, href: "#" },
        { label: "Settings", icon: Settings, href: "#" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Account
          </h1>
          <Link
            href="/"
            className="text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            Marketplace →
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card matching UI reference */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "NM"}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
              <ShieldCheck className="h-3 w-3" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-slate-900 truncate">
              {user?.name || "Welcome to NorthMarket"}
            </h2>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {user?.email || user?.phone || "Fast local shopping in Tamale"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                {user?.role || "CUSTOMER"}
              </span>
              <span className="text-[10px] text-slate-400">• Tamale Member</span>
            </div>
          </div>
        </div>

        {/* Merchant Prompt if customer */}
        <div className="bg-gradient-to-r from-dark-900 to-dark-800 text-white rounded-3xl p-5 shadow-elevated flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Store className="h-4 w-4" />
              <span>Are you a Tamale business owner?</span>
            </div>
            <p className="text-xs text-slate-300">
              Open your merchant stall & sell to thousands across the metropolis.
            </p>
          </div>
          <Link
            href="/seller"
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs px-3.5 py-2 rounded-xl transition shadow-xs shrink-0"
          >
            Sell Now
          </Link>
        </div>

        {/* Menu Sections matching UI Reference */}
        {menuSections.map((sec) => (
          <div
            key={sec.title}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden divide-y divide-slate-100"
          >
            <div className="px-5 py-3 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-amber-50/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-600 group-hover:text-amber-600 group-hover:bg-amber-100/60 transition">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Logout Action Button */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-rose-50/60 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-500 group-hover:bg-rose-100 transition">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-rose-600">
                Log Out
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-rose-300 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </main>
    </div>
  );
}
