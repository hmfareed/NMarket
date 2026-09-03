"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowLeft,
  AlertTriangle,
  Package,
  DollarSign,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface AnalyticsSummary {
  totalRevenue: number;
  netEarnings: number;
  platformFees: number;
  totalOrdersCount: number;
  completedOrdersCount: number;
  fulfillmentRate: number;
  todaySales: number;
  todayOrdersCount: number;
  storeRating: number;
}

interface DayRevenue {
  date: string;
  dayName: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface LowStockItem {
  _id: string;
  name: string;
  price: number;
  available: number;
  onHand: number;
  reserved: number;
  lowStockThreshold: number;
}

export default function SellerAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [history, setHistory] = useState<DayRevenue[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/seller/analytics");
        if (!res.ok) {
          throw new Error("Failed to load store analytics.");
        }
        const data = await res.json();
        setSummary(data.summary);
        setHistory(data.sevenDayHistory || []);
        setTopProducts(data.topProducts || []);
        setLowStock(data.lowStockProducts || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span>Loading merchant intelligence...</span>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...history.map((h) => h.revenue), 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/seller"
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <span>Store Analytics & Intelligence</span>
              </h1>
              <p className="text-xs text-slate-500">
                Revenue trends, stock alerts, and fulfillment scorecards
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/seller/products"
              className="text-xs font-bold text-slate-600 hover:text-emerald-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              Manage Products
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Gross Sales (Total)</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {formatGHS(summary?.totalRevenue || 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Today: {formatGHS(summary?.todaySales || 0)} ({summary?.todayOrdersCount || 0} orders)
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Net Merchant Earnings</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2">
              {formatGHS(summary?.netEarnings || 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Platform Fee (5%): {formatGHS(summary?.platformFees || 0)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Fulfillment Health</span>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {summary?.fulfillmentRate || 100}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary?.completedOrdersCount || 0} of {summary?.totalOrdersCount || 0} packages completed
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Store Rating</span>
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              ★ {summary?.storeRating.toFixed(1) || "5.0"}
            </p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">
              Verified Tamale Merchant
            </p>
          </div>
        </div>

        {/* 7-Day Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span>7-Day Revenue Trend (GH₵)</span>
              </h2>
              <p className="text-xs text-slate-500">Daily sales velocity over the past week</p>
            </div>
          </div>

          <div className="pt-6 pb-2">
            <div className="grid grid-cols-7 gap-3 items-end h-48 border-b border-slate-100 pb-2">
              {history.map((day) => {
                const heightPercent = Math.max(
                  Math.round((day.revenue / maxRevenue) * 100),
                  8
                );
                return (
                  <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      {formatGHS(day.revenue)}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[36px] bg-emerald-500 group-hover:bg-emerald-600 rounded-t-xl transition-all duration-300 relative"
                    >
                      {day.revenue > 0 && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-700">{day.dayName}</p>
                      <p className="text-[10px] text-slate-400">{day.orders} ord</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Section: Low-Stock Alerts & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Low Stock Warning Alert */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Inventory Alert (Low Stock)</h3>
                  <p className="text-xs text-slate-500">Products at or below reorder threshold</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                {lowStock.length} items
              </span>
            </div>

            {lowStock.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">Healthy Stock Levels</p>
                <p>All items have sufficient inventory on hand.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {lowStock.map((item) => (
                  <div key={item._id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500">{formatGHS(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          {item.available} available
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.reserved} in checkout
                        </p>
                      </div>
                      <Link
                        href={`/seller/products`}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition"
                        title="Update Stock"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Top-Selling Products</h3>
                  <p className="text-xs text-slate-500">Ranked by total revenue generated</p>
                </div>
              </div>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <p>No sales records available yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topProducts.map((p, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-700">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500">{p.quantity} units sold</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      {formatGHS(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
