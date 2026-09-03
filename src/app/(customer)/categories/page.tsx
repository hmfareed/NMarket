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

const CATEGORIES_LIST = [
  {
    id: "phones-electronics",
    name: "Phones & Electronics",
    icon: Smartphone,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    description: "Smartphones, chargers, audio & power banks",
    itemCount: "42+ items",
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: Shirt,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    description: "Handwoven Dagbon smocks, dresses & fabrics",
    itemCount: "68+ items",
  },
  {
    id: "shoes",
    name: "Shoes",
    icon: Footprints,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    description: "Leather sandals, sneakers & traditional slippers",
    itemCount: "35+ items",
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    icon: Sparkles,
    color: "bg-pink-50 text-pink-600 border-pink-100",
    description: "Pure Tamale shea butter, soaps & cosmetics",
    itemCount: "50+ items",
  },
  {
    id: "groceries",
    name: "Groceries & Foodstuffs",
    icon: ShoppingBasket,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    description: "Local yams, dawadawa, grains, spices & honey",
    itemCount: "80+ items",
  },
  {
    id: "home-living",
    name: "Home & Living",
    icon: Home,
    color: "bg-orange-50 text-orange-600 border-orange-100",
    description: "Bedding, mats, kitchenware & decor",
    itemCount: "29+ items",
  },
  {
    id: "baby-kids",
    name: "Baby & Kids",
    icon: Baby,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    description: "Children's wear, toys & baby essentials",
    itemCount: "24+ items",
  },
  {
    id: "computers",
    name: "Computers & Tech",
    icon: Laptop,
    color: "bg-cyan-50 text-cyan-600 border-cyan-100",
    description: "Laptops, flash drives, keyboards & accessories",
    itemCount: "31+ items",
  },
  {
    id: "appliances",
    name: "Appliances",
    icon: Tv,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    description: "Fans, blenders, kettles & solar lamps",
    itemCount: "18+ items",
  },
  {
    id: "accessories",
    name: "Accessories",
    icon: Watch,
    color: "bg-teal-50 text-teal-600 border-teal-100",
    description: "Bags, wristwatches, leather belts & jewelry",
    itemCount: "45+ items",
  },
  {
    id: "sports",
    name: "Sports & Fitness",
    icon: Trophy,
    color: "bg-red-50 text-red-600 border-red-100",
    description: "Jerseys, footballs & fitness gear",
    itemCount: "20+ items",
  },
  {
    id: "local-products",
    name: "Local Crafts & Shea",
    icon: Package,
    color: "bg-amber-100/70 text-amber-800 border-amber-200",
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
