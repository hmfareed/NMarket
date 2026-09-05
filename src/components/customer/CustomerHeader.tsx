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
  const [greeting, setGreeting] = useState("Good evening");
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
      {/* Slim pilot banner */}
      <div className="bg-slate-900 text-blue-300 text-[10px] sm:text-xs py-1 px-3 text-center font-medium tracking-wide flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="truncate">
          🇬🇭 <strong className="text-white">Tamale Marketplace:</strong> Fast 45–90 min delivery across Tamale Metropolis
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: User greeting & Location on mobile, Logo on desktop */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Desktop Brand Logo */}
            <div className="hidden sm:block">
              <Logo size="md" showTagline={false} />
            </div>

            {/* Mobile Brand Logo + Greeting */}
            <div className="sm:hidden flex items-center gap-2.5 min-w-0">
              <img
                src="/logo.png"
                alt="NorthMarket"
                className="h-10 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-slate-900 truncate leading-tight flex items-center gap-1">
                  {greeting}, {userName || "Shopper"} 👋
                </span>
                {/* Location Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate max-w-[130px]">Deliver to {selectedArea}</span>
                    <ChevronDown className="h-2.5 w-2.5 shrink-0" />
                  </button>

                  {showAreaDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-2xl shadow-elevated border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        Tamale Delivery Area
                      </div>
                      {tamaleAreas.map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            onAreaChange?.(area);
                            setShowAreaDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-bold transition hover:bg-blue-50 hover:text-blue-700 ${
                            selectedArea === area
                              ? "text-blue-600 bg-blue-50/60 font-black"
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

            {/* Desktop Location Dropdown */}
            <div className="hidden sm:flex flex-col text-xs pl-2 border-l border-slate-200">
              <span className="text-slate-500 font-medium">
                {greeting}, <strong className="text-slate-900 font-bold">{userName || "Shopper"}</strong> 👋
              </span>
              <div className="relative mt-0.5">
                <button
                  type="button"
                  onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                  className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
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
                        className={`w-full text-left px-3 py-1.5 text-xs font-bold transition hover:bg-blue-50 hover:text-blue-700 ${
                          selectedArea === area
                            ? "text-blue-600 bg-blue-50/60 font-black"
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

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/seller"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition"
            >
              <Store className="h-4 w-4 text-blue-600" />
              <span>Sell on NorthMarket</span>
            </Link>

            <Link
              href="/orders"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition"
            >
              <Package className="h-4 w-4 text-slate-500" />
              <span>Orders</span>
            </Link>

            <Link
              href="/orders"
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition relative"
              title="Notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            </Link>

            <Link
              href="/account"
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition hidden sm:flex"
              title="My Account"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              type="button"
              className="relative flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-3 sm:px-4 py-2 rounded-xl shadow-xs transition transform active:scale-95"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="bg-white text-blue-700 text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Full-width Search Bar Row */}
        {onSearchChange && (
          <div className="mt-2.5 relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products, stores, local foods in Tamale..."
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-xs"
              />
            </div>
            <Link
              href="/categories"
              className="p-2 bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl text-slate-600 hover:text-blue-600 transition shadow-xs shrink-0"
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
