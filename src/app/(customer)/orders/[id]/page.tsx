"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ShieldCheck,
  Package,
  Store,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface OrderDetail {
  _id: string;
  orderNumber: string;
  deliveryOtp: string;
  status: string;
  payment: {
    provider: string;
    amount: number;
    status: string;
    method: string;
  };
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
    deliveryFee: number;
    prepTimeMinutes?: number;
    items: {
      productId: string;
      name: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
      imageUrl?: string;
    }[];
  }[];
  totalProductAmount: number;
  totalDeliveryFee: number;
  totalAmount: number;
  createdAt: string;
}

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedOtp, setCopiedOtp] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const copyOtp = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.deliveryOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span>Loading order tracking...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-3 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-900">Order not found</p>
          <Link
            href="/"
            className="block text-xs font-bold text-emerald-600 hover:underline"
          >
            ← Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <span className="font-mono text-xs text-slate-400 font-bold">
            Order Ref: {order.orderNumber}
          </span>
        </div>

        {/* Order Confirmed Banner */}
        <div className="bg-emerald-600 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-emerald-700 text-emerald-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Payment Confirmed ({order.payment.provider})</span>
            </div>
            <h1 className="text-2xl font-black">Order Placed Successfully!</h1>
            <p className="text-xs text-emerald-100">
              Your items are being prepared by verified merchants in Tamale.
            </p>
          </div>

          {/* Delivery OTP Highlight Box */}
          <div className="bg-white text-slate-900 rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto shadow-md border-2 border-emerald-400">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Delivery OTP Guard
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-3xl font-black font-mono tracking-widest text-emerald-700">
                {order.deliveryOtp}
              </span>
              <button
                onClick={copyOtp}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400"
                title="Copy OTP"
              >
                {copiedOtp ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-1 max-w-[170px]">
              Provide this 4-digit code to the delivery rider to release your order.
            </p>
          </div>
        </div>

        {/* Multi-Seller Fulfillment Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Store className="h-4 w-4 text-emerald-600" />
              <span>Merchant Fulfillment Packages ({order.sellerOrders.length})</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Split Order</span>
          </h2>

          <div className="space-y-4">
            {order.sellerOrders.map((so) => (
              <div
                key={so.sellerOrderId}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{so.storeName}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">
                      ({so.sellerOrderId})
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Clock className="h-3 w-3" />
                    <span>{so.status}</span>
                  </span>
                </div>

                {/* Items in this merchant order */}
                <div className="divide-y divide-slate-100">
                  {so.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-800 font-medium">{item.name}</span>
                        <span className="text-slate-400">×{item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {formatGHS(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Price Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-2.5 shadow-xs text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-100 pb-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Delivery Details</span>
            </div>
            <p className="font-bold text-slate-900">{order.shippingAddress.recipient}</p>
            <p className="text-slate-600">{order.shippingAddress.phone}</p>
            <p className="text-slate-600">
              {order.shippingAddress.area}, Tamale ({order.shippingAddress.pickupAddress})
            </p>
            {order.shippingAddress.landmark && (
              <p className="text-slate-400 text-[11px]">
                Landmark: {order.shippingAddress.landmark}
              </p>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-2 shadow-xs text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-100 pb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Payment Receipt</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Items Total:</span>
              <span className="font-bold text-slate-900">{formatGHS(order.totalProductAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tamale Delivery Fee:</span>
              <span className="font-bold text-slate-900">{formatGHS(order.totalDeliveryFee)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-sm text-slate-900">
              <span>Total Paid:</span>
              <span className="text-emerald-700">{formatGHS(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
