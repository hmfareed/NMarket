"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  Package,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Truck,
  ShieldCheck,
  CreditCard,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface AdminMetrics {
  totalGmv: number;
  totalCommission: number;
  totalDeliveryFees: number;
  totalOrders: number;
  orderStatusCounts: {
    PAID: number;
    PROCESSING: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  verifiedStoresCount: number;
  pendingStoresCount: number;
  totalRiders: number;
  onlineRiders: number;
  completedDeliveries: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  area: string;
  totalAmount: number;
  status: string;
  sellerOrderCount: number;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setRecentOrders(data.recentOrders || []);
        }
      } catch (err) {
        console.error("Failed to load admin metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg">
              N
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">
                NMarket Admin Portal
              </span>
              <span className="ml-2 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Super Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/admin/sellers"
              className="text-slate-300 hover:text-white transition font-medium"
            >
              Seller Queue
            </Link>
            <Link
              href="/admin/payouts"
              className="text-slate-300 hover:text-white transition font-medium"
            >
              MoMo Settlements
            </Link>
            <Link
              href="/admin/disputes"
              className="text-slate-300 hover:text-white transition font-medium"
            >
              Disputes
            </Link>
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition font-medium"
            >
              ← View Live Market
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Platform Operations Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Tamale Metropolis — Real-time telemetry, orders & merchant verification
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/payouts"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>MoMo Settlements</span>
            </Link>
            <Link
              href="/admin/sellers"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Seller Reviews ({metrics?.pendingStoresCount || 0})</span>
            </Link>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span>Loading operations metrics...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* GMV */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Gross Market Value (GMV)</p>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {formatGHS(metrics?.totalGmv || 0)}
                </p>
                <p className="text-[11px] font-medium text-emerald-600">
                  {metrics?.totalOrders || 0} Total Orders
                </p>
              </div>

              {/* Commission Revenue */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Platform Commission</p>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-emerald-700">
                  {formatGHS(metrics?.totalCommission || 0)}
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                  Net NMarket Revenue
                </p>
              </div>

              {/* Verified Stores */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Active Stores in Tamale</p>
                  <Store className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {metrics?.verifiedStoresCount || 0}
                </p>
                <p className="text-[11px] font-medium text-amber-600">
                  {metrics?.pendingStoresCount || 0} Pending Verification
                </p>
              </div>

              {/* Active Fleet */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Active Delivery Fleet</p>
                  <Truck className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {metrics?.onlineRiders || 0} <span className="text-xs font-normal text-slate-400">/ {metrics?.totalRiders || 0}</span>
                </p>
                <p className="text-[11px] font-medium text-emerald-600">
                  {metrics?.completedDeliveries || 0} Completed Deliveries
                </p>
              </div>
            </div>

            {/* Management Queues & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Management Queues */}
              <div className="lg:col-span-5 space-y-4">
                {/* Seller Queue Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Store className="h-4 w-4 text-emerald-600" />
                      <span>Seller Verification Queue</span>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {metrics?.pendingStoresCount || 0} Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Review merchant identity documents (Ghana Card), store categories, and Lamashegu/Central pickup locations.
                  </p>
                  <Link
                    href="/admin/sellers"
                    className="block text-center w-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl transition"
                  >
                    Open Seller Review Queue →
                  </Link>
                </div>

                {/* MoMo Settlements Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                      <span>Escrow & MoMo Disbursements</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Settlements
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Process Mobile Money batch payouts for completed orders to merchants and riders in Tamale.
                  </p>
                  <Link
                    href="/admin/payouts"
                    className="block text-center w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl transition"
                  >
                    Open Payouts Center →
                  </Link>
                </div>

                {/* Disputes & Complaints Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span>Disputes & Protection</span>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Adjudication
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Investigate customer complaints, damaged item reports, and authorize refunds.
                  </p>
                  <Link
                    href="/admin/disputes"
                    className="block text-center w-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl transition"
                  >
                    Manage Disputes →
                  </Link>
                </div>
              </div>

              {/* Right Column: Recent Platform Orders */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900">
                    Recent Platform Orders
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Tamale Metropolis</span>
                </div>

                {recentOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">
                    No orders placed yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="py-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                order.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.status === "PAID"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            {order.customerName} • {order.area} ({order.sellerOrderCount} packages)
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {formatGHS(order.totalAmount)}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
