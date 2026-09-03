"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  Filter,
  ShoppingBag,
  Store,
  ChevronRight,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface OrderSummaryItem {
  _id: string;
  orderNumber: string;
  deliveryOtp: string;
  status: string;
  totalProductAmount: number;
  totalDeliveryFee: number;
  totalAmount: number;
  shippingAddress: {
    recipient: string;
    phone: string;
    area: string;
    pickupAddress: string;
    landmark?: string;
  };
  sellerOrders: {
    sellerOrderId: string;
    storeName: string;
    status: string;
    subtotal: number;
    items: {
      productId: string;
      name: string;
      quantity: number;
      totalPrice: number;
    }[];
  }[];
  createdAt: string;
}

export default function CustomerOrdersDashboard() {
  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Failed to load customer orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const copyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ACTIVE") {
      return ["PENDING", "PAID", "PROCESSING"].includes(o.status);
    }
    if (filter === "COMPLETED") {
      return o.status === "COMPLETED";
    }
    return true;
  });

  const activeOrdersCount = orders.filter((o) =>
    ["PENDING", "PAID", "PROCESSING"].includes(o.status)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-black text-slate-900 text-base tracking-tight">
                My Orders
              </h1>
              <p className="text-[11px] text-slate-400">Tamale Deliveries & Receipts</p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
          >
            Marketplace
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Filter Navigation */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs text-xs font-bold">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                filter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter("ACTIVE")}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                filter === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Active</span>
              {activeOrdersCount > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                  {activeOrdersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                filter === "COMPLETED"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span>Loading your order history...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-sm mx-auto space-y-4 shadow-xs">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">No orders in this view</h3>
              <p className="text-xs text-slate-500">
                Explore authentic goods from verified stores across Tamale Central & Outer.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition shadow-xs"
            >
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isActive = ["PENDING", "PAID", "PROCESSING"].includes(order.status);
              const totalItems = order.sellerOrders.reduce(
                (sum, so) => sum + so.items.reduce((iSum, i) => iSum + i.quantity, 0),
                0
              );

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5 hover:border-slate-300 transition"
                >
                  {/* Top Bar: Order Number, Date & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full w-fit ${
                        order.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "PAID"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "PROCESSING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>{order.status}</span>
                    </span>
                  </div>

                  {/* Active Order Highlight: 4-digit Delivery OTP Guard */}
                  {isActive && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <span>Delivery Handshake OTP</span>
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Hand this 4-digit code to the rider once your package arrives at your door.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="bg-white px-4 py-1.5 rounded-xl border border-emerald-300 font-mono font-black text-xl text-emerald-700 tracking-widest">
                          {order.deliveryOtp}
                        </div>
                        <button
                          onClick={() => copyOtp(order.deliveryOtp)}
                          className="p-2 bg-white hover:bg-emerald-100 rounded-xl border border-emerald-300 text-emerald-700 transition"
                          title="Copy OTP"
                        >
                          {copiedOtp === order.deliveryOtp ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Item List & Merchants */}
                  <div className="space-y-2.5">
                    {order.sellerOrders.map((so) => (
                      <div
                        key={so.sellerOrderId}
                        className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1 text-slate-900">
                            <Store className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{so.storeName}</span>
                          </span>
                          <span className="text-slate-400 font-normal">
                            Package {so.sellerOrderId}
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {so.items.map((item, i) => (
                            <div
                              key={i}
                              className="py-1.5 flex items-center justify-between text-xs"
                            >
                              <span className="text-slate-800 font-medium">
                                {item.name} <span className="text-slate-400">×{item.quantity}</span>
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                {formatGHS(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer: Destination, Total & Tracking Link */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        Delivering to <strong>{order.shippingAddress.area}</strong>, Tamale
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Total Paid</span>
                        <span className="font-mono font-black text-sm text-slate-900">
                          {formatGHS(order.totalAmount)}
                        </span>
                      </div>

                      <Link
                        href={`/orders/${order._id}`}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-xs"
                      >
                        <span>Track Order</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
