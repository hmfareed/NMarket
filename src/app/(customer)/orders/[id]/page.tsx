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
  Star,
  AlertTriangle,
  X,
  Phone,
  MessageSquare,
  Navigation,
  KeyRound,
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

  // Review Modal State
  const [reviewItem, setReviewItem] = useState<{ productId: string; name: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Dispute Modal State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState<
    "WRONG_ITEM" | "DAMAGED" | "MISSING_ITEM" | "LATE_DELIVERY" | "OTHER"
  >("WRONG_ITEM");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState<string | null>(null);

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
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewItem || !order) return;
    setReviewLoading(true);
    setReviewMessage(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          productId: reviewItem.productId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewMessage(data.error || "Failed to submit review.");
      } else {
        setReviewMessage("Review submitted! Thank you.");
        setTimeout(() => {
          setReviewItem(null);
          setReviewComment("");
          setReviewMessage(null);
        }, 2000);
      }
    } catch (err) {
      setReviewMessage("Network error submitting review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setDisputeLoading(true);
    setDisputeMessage(null);
    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          reason: disputeReason,
          description: disputeDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDisputeMessage(data.error || "Failed to submit dispute.");
      } else {
        setDisputeMessage("Dispute opened. Our admin team will investigate.");
        setTimeout(() => {
          setShowDisputeModal(false);
          setDisputeDescription("");
          setDisputeMessage(null);
        }, 2500);
      }
    } catch (err) {
      setDisputeMessage("Network error submitting dispute.");
    } finally {
      setDisputeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
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
            className="block text-xs font-bold text-amber-600 hover:underline"
          >
            ← Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Stepper logic matching reference
  const isDelivered = order.status === "COMPLETED";
  const isOutForDelivery =
    order.status === "PROCESSING" ||
    order.sellerOrders.some((so) => so.status === "HANDED_TO_RIDER");
  const isPreparing =
    order.status === "PAID" ||
    order.sellerOrders.some((so) => ["ACCEPTED", "READY_FOR_PICKUP"].includes(so.status));

  const steps = [
    {
      title: "Order Placed",
      time: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      done: true,
    },
    {
      title: "Seller Confirmed",
      time: "Confirmed",
      done: true,
    },
    {
      title: "Order Preparing",
      time: "In kitchen / stall",
      done: isPreparing || isOutForDelivery || isDelivered,
    },
    {
      title: "Rider Picked Up",
      time: "En route",
      done: isOutForDelivery || isDelivered,
    },
    {
      title: "Out for Delivery",
      time: "Local dispatch",
      active: isOutForDelivery && !isDelivered,
      done: isDelivered,
    },
    {
      title: "Delivered",
      time: "Handover with OTP",
      done: isDelivered,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Top Header matching reference: "← Track Order" */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 font-bold p-2 bg-white rounded-xl border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Track Order</span>
          </Link>
          <span className="text-xs font-mono font-bold text-slate-500">
            Order #{order.orderNumber}
          </span>
        </div>

        {/* Order Info & Placed Date */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-slate-400">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <span className="text-xs font-black bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
              {order.status}
            </span>
          </div>

          {/* Big Status Card matching reference: "Out for Delivery 🛵" */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-black flex items-center gap-1.5">
                <span>{isDelivered ? "Delivered Successfully 🎉" : "Out for Delivery 🛵"}</span>
              </span>
              <p className="text-xs text-amber-100">
                {isDelivered
                  ? "Package handed over and verified via OTP."
                  : "Your order is on the way through Tamale local fleet."}
              </p>
            </div>
          </div>

          {/* Delivery OTP Highlight Box */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Delivery Handshake OTP
                </span>
                <span className="text-2xl font-black font-mono tracking-widest text-amber-800">
                  {order.deliveryOtp}
                </span>
              </div>
            </div>
            <button
              onClick={copyOtp}
              type="button"
              className="flex items-center gap-1.5 bg-white text-slate-700 hover:text-amber-700 px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs shadow-xs transition"
            >
              {copiedOtp ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copiedOtp ? "Copied" : "Copy OTP"}</span>
            </button>
          </div>

          {/* Vertical Stepped Progress Tracker matching reference */}
          <div className="pt-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">
              Live Order Status
            </h3>
            <div className="space-y-4 relative pl-6 border-l-2 border-slate-200 ml-3">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Step Dot / Icon */}
                  <div
                    className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step.done
                        ? "bg-emerald-500 text-white shadow-xs"
                        : step.active
                        ? "bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {step.done ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                  </div>

                  <div>
                    <p
                      className={`text-xs font-bold ${
                        step.done || step.active ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Preview & Rider Contact Card matching reference */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-amber-600" />
              <span>Tamale Delivery Route</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {order.shippingAddress.area}, Tamale
            </span>
          </div>

          {/* Stylized Map View Box */}
          <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
            <div className="relative flex flex-col items-center gap-1 text-center p-3">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-elevated animate-bounce">
                <Truck className="h-6 w-6" />
              </div>
              <p className="text-xs font-black text-slate-800">
                Dispatch Route: {order.sellerOrders[0]?.storeName || "Tamale Merchant"} → {order.shippingAddress.area}
              </p>
              <p className="text-[10px] text-slate-500">
                Dropoff Address: {order.shippingAddress.pickupAddress}
              </p>
            </div>
          </div>

          {/* Rider Profile Card matching reference: "Abdul Rahman / Rating 4.8 / Call / Message" */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-base shadow-xs">
                AR
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Abdul Rahman</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span className="font-bold text-slate-800">4.8</span>
                  <span>• Tamale Local Rider</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:0241234567"
                className="p-2.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 rounded-xl border border-slate-200 shadow-xs transition"
                title="Call Rider"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href="sms:0241234567"
                className="p-2.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 rounded-xl border border-slate-200 shadow-xs transition"
                title="Message Rider"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Order Items & Review Action */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Package Items
            </h3>
            <span className="text-xs font-bold text-slate-900">
              Total: {formatGHS(order.totalAmount)}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {order.sellerOrders.flatMap((so) =>
              so.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatGHS(item.unitPrice)} × {item.quantity} • {so.storeName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900">
                      {formatGHS(item.totalPrice)}
                    </span>
                    <button
                      onClick={() => setReviewItem({ productId: item.productId, name: item.name })}
                      className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-200 transition flex items-center gap-1"
                    >
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-slate-500 hover:text-rose-600 font-bold transition flex items-center gap-1"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Report an Issue</span>
            </button>
            <Link
              href="/"
              className="font-bold text-amber-600 hover:text-amber-700"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-elevated animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Review {reviewItem.name}
              </h3>
              <button
                onClick={() => setReviewItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rating: {reviewRating} / 5 Stars
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= reviewRating
                            ? "fill-amber-500 text-amber-500"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Review
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this item..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {reviewMessage && (
                <p className="text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-xl">
                  {reviewMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-elevated animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Report Order Issue
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issue Reason
                </label>
                <select
                  value={disputeReason}
                  onChange={(e: any) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="WRONG_ITEM">Wrong item delivered</option>
                  <option value="DAMAGED">Damaged item</option>
                  <option value="MISSING_ITEM">Missing item</option>
                  <option value="LATE_DELIVERY">Unacceptable delay</option>
                  <option value="OTHER">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Describe the issue with your order..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {disputeMessage && (
                <p className="text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-xl">
                  {disputeMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={disputeLoading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
              >
                {disputeLoading ? "Filing..." : "Submit Report"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
