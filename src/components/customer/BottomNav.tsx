"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Package, Heart, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/categories", icon: Grid },
    { label: "Orders", href: "/orders", icon: Package },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
    { label: "Account", href: "/account", icon: User },
  ];

  // Don't render on seller or admin paths
  if (pathname.startsWith("/seller") || pathname.startsWith("/admin") || pathname.startsWith("/rider")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 sm:hidden shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-amber-600 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? "bg-amber-50" : ""
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition ${
                    isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
