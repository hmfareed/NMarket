"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  Shirt,
  Footprints,
  Sparkles,
  ShoppingBasket,
  Home,
  Baby,
  Laptop,
  Tv,
  Watch,
  Trophy,
  Package,
  ChevronRight,
} from "lucide-react";

import { HealthBeautyIcon } from "@/components/customer/MegaCategoryNav";

const CATEGORIES_LIST = [
  {
    id: "phones-electronics",
    name: "Phones & Electronics",
    icon: Smartphone,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Smartphones, chargers, audio & power banks",
    itemCount: "42+ items",
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: Shirt,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Handwoven Dagbon smocks, dresses & fabrics",
    itemCount: "68+ items",
  },
  {
    id: "shoes",
    name: "Shoes",
    icon: Footprints,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Leather sandals, sneakers & traditional slippers",
    itemCount: "35+ items",
  },
  {
    id: "beauty",
    name: "Health & Beauty",
    icon: HealthBeautyIcon,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Pure Tamale shea butter, organic skincare & makeup",
    itemCount: "50+ items",
  },
  {
    id: "groceries",
    name: "Groceries & Foodstuffs",
    icon: ShoppingBasket,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Local yams, dawadawa, grains, spices & honey",
    itemCount: "80+ items",
  },
  {
    id: "home-living",
    name: "Home & Office",
    icon: Home,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Bedding, mats, kitchenware & decor",
    itemCount: "29+ items",
  },
  {
    id: "baby-kids",
    name: "Baby Products",
    icon: Baby,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Children's wear, toys & baby essentials",
    itemCount: "24+ items",
  },
  {
    id: "computers",
    name: "Computing",
    icon: Laptop,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Laptops, flash drives, keyboards & accessories",
    itemCount: "31+ items",
  },
  {
    id: "appliances",
    name: "Appliances",
    icon: Tv,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Fans, blenders, kettles & solar lamps",
    itemCount: "18+ items",
  },
  {
    id: "accessories",
    name: "Accessories",
    icon: Watch,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Bags, wristwatches, leather belts & jewelry",
    itemCount: "45+ items",
  },
  {
    id: "sports",
    name: "Sporting Goods",
    icon: Trophy,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Jerseys, footballs & fitness gear",
    itemCount: "20+ items",
  },
  {
    id: "local-products",
    name: "Crafts & Shea",
    icon: Package,
    color: "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-300",
    description: "Authentic Northern Ghana handmade treasures",
    itemCount: "75+ items",
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Categories
              </h1>
              <p className="text-xs text-slate-500">
                Explore local products across Tamale
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Grid matching UI DESIGN reference */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            All Categories
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            12 departments
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORIES_LIST.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevated hover:border-amber-400 transition-all duration-300 flex flex-col items-center text-center space-y-3 relative overflow-hidden"
              >
                {/* Visual Icon Badge */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${cat.color} group-hover:scale-110 transition-transform duration-300 shadow-xs`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-900 group-hover:text-amber-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-auto pt-2 flex items-center gap-1 text-[10px] font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                  <span>{cat.itemCount}</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
