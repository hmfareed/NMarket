"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  ShoppingBag,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Loader2,
} from "lucide-react";

interface StoreData {
  _id: string;
  name: string;
  slug: string;
  phone: string;
  verificationStatus: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  address: {
    area: string;
    pickupAddress: string;
  };
  ghanaCardNumber: string;
  payoutInfo: {
    provider: string;
    accountNumber: string;
    accountName: string;
  };
  performance: {
    rating: number;
    totalOrders: number;
    score: number;
  };
  rejectedReason?: string;
  createdAt: string;
}

export default function SellerPortalPage() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StoreData | null>(null);

  useEffect(() => {
    async function loadStore() {
      try {
        const res = await fetch("/api/seller/store");
        if (res.ok) {
          const data = await res.json();
          setStore(data.store);
        }
      } catch (err) {
        console.error("Failed to load store status:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Seller Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">
              NMarket <span className="text-emerald-600 font-medium text-sm">Merchant</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {store?.verificationStatus === "VERIFIED" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified Seller</span>
              </span>
            )}
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              ← Customer Market
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* CASE 1: NO STORE YET -> ONBOARDING CTA */}
        {!store && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto my-6">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Start Selling to Customers Across Tamale
            </h1>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Register your business in Lamashegu, Central Market, Vittin, or Sakasaka.
              Set your pickup location, verify your Ghana Card, and start getting fast local orders.
            </p>
            <div className="mt-6">
              <Link
                href="/seller/onboarding"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-sm transition"
              >
                <span>Complete Seller Registration</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* CASE 2: PENDING / UNDER REVIEW */}
        {store && (store.verificationStatus === "PENDING" || store.verificationStatus === "UNDER_REVIEW") && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-2xl mx-auto my-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Application Under Review
                </h2>
                <p className="text-xs text-slate-500">
                  Your store application for <span className="font-bold text-slate-800">{store.name}</span> is being verified.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tamale Community:</span>
                <span className="font-bold text-slate-900">{store.address.area} ({store.address.pickupAddress})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ghana Card:</span>
                <span className="font-mono font-bold text-slate-900">{store.ghanaCardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MoMo Payout:</span>
                <span className="font-bold text-slate-900">
                  {store.payoutInfo.provider} — {store.payoutInfo.accountNumber} ({store.payoutInfo.accountName})
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <p className="font-bold">Estimated review time: 2–4 business hours</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                You will be able to publish products as soon as our Tamale operations team verifies your details.
              </p>
            </div>
          </div>
        )}

        {/* CASE 3: REJECTED */}
        {store && store.verificationStatus === "REJECTED" && (
          <div className="bg-white rounded-3xl border border-red-200 p-8 shadow-xs max-w-2xl mx-auto my-6 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-lg font-black text-slate-900">
                Application Needs Attention
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              Reason provided: <strong>{store.rejectedReason || "Information incomplete or unverified."}</strong>
            </p>
            <Link
              href="/seller/onboarding"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
            >
              <span>Update Application Details</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* CASE 4: VERIFIED MERCHANT DASHBOARD */}
        {store && store.verificationStatus === "VERIFIED" && (
          <div className="space-y-6">
            {/* Store Banner */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">{store.name}</h1>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{store.address.area}, Tamale ({store.address.pickupAddress})</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/seller/products/new"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-xs"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add New Product</span>
                </Link>
              </div>
            </div>

            {/* Merchant KPI Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Today's Sales</p>
                <p className="text-2xl font-black text-slate-900 mt-1">₵0.00</p>
                <p className="text-[11px] text-slate-400 mt-1">0 orders today</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Store Rating</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  ★ {store.performance?.rating || 5.0}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Top Merchant</p>
              </div>
              <Link
                href="/seller/products"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition block"
              >
                <p className="text-xs font-semibold text-slate-500">Active Products</p>
                <p className="text-2xl font-black text-slate-900 mt-1">Manage →</p>
                <p className="text-[11px] text-emerald-600 mt-1 font-semibold">View catalog</p>
              </Link>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">MoMo Payout Account</p>
                <p className="text-sm font-black text-slate-900 mt-1 truncate">
                  {store.payoutInfo.accountNumber}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1">{store.payoutInfo.provider}</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/seller/products"
                className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 hover:border-emerald-500 hover:shadow-xs transition block"
              >
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <span>Product Catalog</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Manage product variants, photos, descriptions, and two-tier inventory.
                </p>
              </Link>
              <Link
                href="/seller/orders"
                className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 hover:border-emerald-500 hover:shadow-xs transition block"
              >
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <ShoppingBag className="h-4 w-4 text-emerald-600" />
                  <span>Fulfillment Orders</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  View pending buyer purchases, prepare items, and hand over to riders.
                </p>
              </Link>
              <Link
                href="/seller/analytics"
                className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 hover:border-emerald-500 hover:shadow-xs transition block"
              >
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span>Analytics & Intelligence</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  7-day revenue velocity, stockout alerts, top-selling items, and fulfillment scorecards.
                </p>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
