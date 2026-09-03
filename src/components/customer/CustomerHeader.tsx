"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  ShoppingBag,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  User,
  Store,
  Package,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { useCart } from "@/context/CartContext";

interface CustomerHeaderProps {
  onOpenCart?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  selectedArea?: string;
  onAreaChange?: (area: string) => void;
}

export default function CustomerHeader({
  onOpenCart,
  searchQuery = "",
  onSearchChange,
  selectedArea = "Tamale Central",
  onAreaChange,
}: CustomerHeaderProps) {
  const { itemCount } = useCart();
  const [userName, setUserName] = useState<string | null>(null);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  // Time-based greeting
  const [greeting, setGreeting] = useState("Good day");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Fetch user info
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name) {
          const first = data.user.name.split(" ")[0];
          setUserName(first);
        }
      })
      .catch(() => {});
  }, []);

  const tamaleAreas = [
    "Tamale Central",
    "Lamashegu",
    "Sakasaka",
    "Vittin",
    "Sagnarigu",
    "Aboabo",
    "Choggu",
    "Kukuo",
  ];

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top Banner for Tamale Pilot */}
      <div className="bg-dark-900 text-amber-400 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          🇬🇭 <strong className="text-white">NorthMarket Tamale Pilot:</strong> Instant local delivery across Tamale Metropolis in under 45 mins!
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Main Row: Logo, User Greeting/Location, Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo size="md" showTagline={false} />

            {/* User Greeting & Location (Matches UI Reference: "Good evening, Mohammed 👋 / Deliver to Tamale Central ⌵") */}
            <div className="hidden md:flex flex-col text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                {greeting}, <strong className="text-slate-900 font-bold">{userName || "Shopper"}</strong> 👋
              </span>
              <div className="relative mt-0.5">
                <button
                  type="button"
                  onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                  className="flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700 transition cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Deliver to {selectedArea}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showAreaDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-elevated border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Tamale Area
                    </div>
                    {tamaleAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          onAreaChange?.(area);
                          setShowAreaDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-bold transition hover:bg-amber-50 hover:text-amber-700 ${
                          selectedArea === area
                            ? "text-amber-600 bg-amber-50/60"
                            : "text-slate-700"
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <Link
              href="/seller"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              <Store className="h-4 w-4 text-amber-500" />
              <span>Sell on NorthMarket</span>
            </Link>

            <Link
              href="/orders"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              <Package className="h-4 w-4 text-slate-500" />
              <span>My Orders</span>
            </Link>

            <Link
              href="/account"
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition hidden sm:flex"
              title="My Account"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart Button with Count Badge */}
            <button
              onClick={onOpenCart}
              type="button"
              className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition transform active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="bg-dark-900 text-amber-400 text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Row (Present on Mobile & Desktop as shown in UI reference) */}
        {onSearchChange && (
          <div className="mt-3 relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products, stores, local foods in Tamale..."
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-xs"
              />
            </div>
            <Link
              href="/categories"
              className="p-2.5 bg-slate-50 border border-slate-200 hover:border-amber-300 rounded-2xl text-slate-600 hover:text-amber-600 transition shadow-xs"
              title="Filter by Categories"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
