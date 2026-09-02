"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  ArrowLeft,
  Loader2,
  Filter,
  Truck,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface SellerOrderItem {
  parentOrderId: string;
  orderNumber: string;
  sellerOrderId: string;
  status: "PENDING" | "ACCEPTED" | "PROCESSING" | "READY_FOR_PICKUP" | "HANDED_TO_RIDER" | "COMPLETED";
  items: {
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
  subtotal: number;
  sellerEarning: number;
  prepTimeMinutes: number;
  customerName: string;
  customerPhone: string;
  destinationArea: string;
  deliveryInstructions?: string;
  orderPlacedAt: string;
}

export default function SellerOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SellerOrderItem[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    ready: 0,
    completed: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seller/orders?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setCounts(data.counts || { all: 0, pending: 0, processing: 0, ready: 0, completed: 0 });
      }
    } catch (err) {
      console.error("Failed to load seller orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const updateOrderStatus = async (parentOrderId: string, sellerOrderId: string, nextStatus: string) => {
    setActionLoading(sellerOrderId);
    try {
      const res = await fetch(`/api/seller/orders/${parentOrderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, sellerOrderId }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight">
                NMarket <span className="text-emerald-600 font-medium text-sm">Merchant</span>
              </span>
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-xs font-bold text-slate-700">Fulfillment Orders</span>
          </div>

          <Link
            href="/seller"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              Incoming Customer Orders
            </h1>
            <p className="text-xs text-slate-500">
              Accept orders, prepare items, and hand over to local delivery riders
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <Filter className="h-3 w-3 text-slate-400 ml-2" />
            {[
              { id: "ALL", label: `All (${counts.all})` },
              { id: "PENDING", label: `New (${counts.pending})` },
              { id: "PROCESSING", label: `In Prep (${counts.processing})` },
              { id: "READY_FOR_PICKUP", label: `Ready (${counts.ready})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-24 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No orders in this view</p>
            <p className="text-xs text-slate-500">
              New customer purchases will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.sellerOrderId}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {o.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        (Package {o.sellerOrderId})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Placed: {new Date(o.orderPlacedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Est. Prep: {o.prepTimeMinutes} mins
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        o.status === "READY_FOR_PICKUP"
                          ? "bg-purple-100 text-purple-800"
                          : o.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-800"
                          : o.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>{o.status.replace(/_/g, " ")}</span>
                    </span>
                  </div>
                </div>

                {/* Destination & Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Items List */}
                  <div className="md:col-span-7 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Items to Prepare
                    </span>
                    <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl p-3">
                      {o.items.map((item, i) => (
                        <div key={i} className="py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-900">{item.name}</span>
                            <span className="text-slate-500">×{item.quantity}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-800">
                            {formatGHS(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Delivery Details */}
                  <div className="md:col-span-5 bg-slate-50 rounded-2xl p-3.5 text-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Buyer & Delivery
                      </span>
                      <p className="font-bold text-slate-900">{o.customerName}</p>
                      <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{o.customerPhone}</span>
                      </p>
                      <p className="text-slate-600 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{o.destinationArea}, Tamale</span>
                      </p>
                      {o.deliveryInstructions && (
                        <p className="text-[10px] text-slate-400 italic mt-1">
                          "{o.deliveryInstructions}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500">Your Net Earning:</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        {formatGHS(o.sellerEarning)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  {o.status === "PENDING" && (
                    <button
                      type="button"
                      disabled={actionLoading === o.sellerOrderId}
                      onClick={() => updateOrderStatus(o.parentOrderId, o.sellerOrderId, "ACCEPTED")}
                      className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Accept Order</span>
                    </button>
                  )}

                  {o.status === "ACCEPTED" && (
                    <button
                      type="button"
                      disabled={actionLoading === o.sellerOrderId}
                      onClick={() => updateOrderStatus(o.parentOrderId, o.sellerOrderId, "PROCESSING")}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-xs"
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>Start Preparation</span>
                    </button>
                  )}

                  {o.status === "PROCESSING" && (
                    <button
                      type="button"
                      disabled={actionLoading === o.sellerOrderId}
                      onClick={() => updateOrderStatus(o.parentOrderId, o.sellerOrderId, "READY_FOR_PICKUP")}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-xs"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Ready for Rider Pickup</span>
                    </button>
                  )}

                  {o.status === "READY_FOR_PICKUP" && (
                    <button
                      type="button"
                      disabled={actionLoading === o.sellerOrderId}
                      onClick={() => updateOrderStatus(o.parentOrderId, o.sellerOrderId, "HANDED_TO_RIDER")}
                      className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Confirm Package Handed to Rider</span>
                    </button>
                  )}

                  {["HANDED_TO_RIDER", "COMPLETED"].includes(o.status) && (
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Dispatched with Rider</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
