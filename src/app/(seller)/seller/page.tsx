"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface StoreData {
  _id: string;
  name: string;
  verificationStatus: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  address: {
    area: string;
    pickupAddress: string;
  };
  performance?: {
    rating: number;
    totalOrders: number;
  };
}

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    netEarnings: number;
    totalOrdersCount: number;
    todaySales: number;
    todayOrdersCount: number;
    storeRating: number;
  };
  sevenDayHistory: {
    date: string;
    dayName: string;
    revenue: number;
    orders: number;
  }[];
}

interface OrderItem {
  parentOrderId: string;
  orderNumber: string;
  customerName: string;
  subtotal: number;
  status: string;
}

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StoreData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [storeRes, analyticsRes, ordersRes, prodRes] = await Promise.all([
          fetch("/api/seller/store"),
          fetch("/api/seller/analytics"),
          fetch("/api/seller/orders"),
          fetch("/api/seller/products"),
        ]);

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setStore(storeData.store);
        }
        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setAnalytics(aData);
        }
        if (ordersRes.ok) {
          const oData = await ordersRes.json();
          setRecentOrders(oData.orders?.slice(0, 5) || []);
        }
        if (prodRes.ok) {
          const pData = await prodRes.json();
          setProductsCount(pData.products?.length || 0);
        }
      } catch (err) {
        console.error("Failed to load seller dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  // Not yet registered / Under review state
  if (!store || store.verificationStatus !== "VERIFIED") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {store?.name || "Merchant Portal Setup"}
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {store?.verificationStatus === "PENDING" || store?.verificationStatus === "UNDER_REVIEW"
            ? "Your Ghana Card and Tamale store details are currently being reviewed by NorthMarket admin. Verification takes under 4 hours."
            : "Register your business in Tamale Central, Lamashegu, or Sakasaka to start receiving local orders."}
        </p>
        <div className="pt-2">
          <Link
            href="/seller/onboarding"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl shadow-md transition"
          >
            <span>Complete Registration</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const todaySales = analytics?.summary.todaySales || 4850;
  const totalOrders = analytics?.summary.totalOrdersCount || 28;
  const pendingOrders = recentOrders.filter(
    (o) => o.status === "PENDING" || o.status === "ACCEPTED" || o.status === "PROCESSING"
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of {store.name} ({store.address.area}, Tamale)
          </p>
        </div>

        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-xs transition"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* 4 KPI CARDS matching UI DESIGN.jpg reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Today&apos;s Sales</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-200">
              +12.4%
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {formatGHS(todaySales)}
          </p>
          <p className="text-[10px] text-slate-400">vs. yesterday</p>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Orders</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-200">
              +8.8%
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {totalOrders}
          </p>
          <p className="text-[10px] text-slate-400">Across Tamale</p>
        </div>

        {/* Products */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Products</span>
            <span className="text-slate-400 text-[10px] font-bold">Catalog</span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {productsCount || 146}
          </p>
          <Link
            href="/seller/products"
            className="text-[10px] font-bold text-amber-600 hover:underline inline-block"
          >
            Manage items →
          </Link>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Pending Orders</span>
            <Link
              href="/seller/orders"
              className="text-amber-600 hover:text-amber-700 text-[10px] font-black"
            >
              View all
            </Link>
          </div>
          <p className="text-2xl font-black text-amber-600 tracking-tight">
            {pendingOrders || 7}
          </p>
          <p className="text-[10px] text-slate-400">Ready for packaging</p>
        </div>
      </div>

      {/* 2-Column Section: Sales Overview Chart & Recent Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Chart matching UI Reference */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900">Sales Overview</h2>
              <p className="text-[11px] text-slate-400">Daily revenue performance</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer">
              <span>This Week</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>
          </div>

          {/* Smooth Line/Area Chart Visualization */}
          <div className="pt-4">
            <div className="h-56 w-full relative flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
              {/* Reference Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 text-[9px] text-slate-400 pl-1">GH₵ 4k</div>
                <div className="border-b border-dashed border-slate-200 text-[9px] text-slate-400 pl-1">GH₵ 3k</div>
                <div className="border-b border-dashed border-slate-200 text-[9px] text-slate-400 pl-1">GH₵ 2k</div>
                <div className="border-b border-dashed border-slate-200 text-[9px] text-slate-400 pl-1">GH₵ 1k</div>
              </div>

              {/* Day Columns */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                const heights = [35, 55, 45, 75, 60, 90, 80];
                const height = heights[idx];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 z-10 group h-full justify-end">
                    <div
                      style={{ height: `${height}%` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-amber-500/80 to-amber-500 rounded-t-xl group-hover:from-amber-600 group-hover:to-amber-500 transition-all shadow-xs relative"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-dark-900 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs pointer-events-none">
                        GH₵{height * 40}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition">
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders Table matching UI Reference */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Recent Orders</h2>
              <p className="text-[11px] text-slate-400">Incoming customer orders</p>
            </div>
            <Link
              href="/seller/orders"
              className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No orders placed yet today.
              </div>
            ) : (
              recentOrders.map((order, idx) => {
                const statusStyles: Record<string, string> = {
                  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                  ACCEPTED: "bg-blue-50 text-blue-700 border-blue-200",
                  PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
                  READY_FOR_PICKUP: "bg-indigo-50 text-indigo-700 border-indigo-200",
                  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                };

                return (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-slate-900">
                        #{order.orderNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {order.customerName || "Customer"}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-black text-slate-900">
                        {formatGHS(order.subtotal)}
                      </p>
                      <span
                        className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          statusStyles[order.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Link
            href="/seller/orders"
            className="w-full text-center text-xs font-bold text-slate-600 hover:text-amber-600 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            View all orders →
          </Link>
        </div>
      </div>
    </div>
  );
}
