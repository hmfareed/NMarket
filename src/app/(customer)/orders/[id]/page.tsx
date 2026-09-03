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
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !reviewItem) return;
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
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-800 font-medium">{item.name}</span>
                        <span className="text-slate-400">×{item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">
                          {formatGHS(item.totalPrice)}
                        </span>
                        <button
                          onClick={() => setReviewItem({ productId: item.productId, name: item.name })}
                          className="text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold px-2 py-1 rounded-lg border border-emerald-200 transition flex items-center gap-1"
                        >
                          <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                          <span>Review</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Report an Issue / Dispute Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-xs text-slate-400 hover:text-amber-700 font-bold inline-flex items-center gap-1 transition"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Report an Issue / Open Dispute with this Order</span>
            </button>
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

        {/* Review Modal */}
        {reviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <h3 className="font-bold text-slate-900 text-sm">Review Product</h3>
                </div>
                <button
                  onClick={() => setReviewItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="font-bold text-xs text-slate-900">{reviewItem.name}</p>
                <p className="text-[11px] text-slate-400">
                  Share your experience with fellow Tamale shoppers
                </p>
              </div>

              {reviewMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  {reviewMessage}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= reviewRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Review Feedback
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="e.g. Excellent quality smock! Delivered quickly in Lamashegu."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewItem(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    {reviewLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Open Order Dispute</h3>
                </div>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="font-bold text-xs text-slate-900">Order Ref: {order.orderNumber}</p>
                <p className="text-[11px] text-slate-400">
                  Our operations team investigates all disputes within 24 hours.
                </p>
              </div>

              {disputeMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  {disputeMessage}
                </div>
              )}

              <form onSubmit={handleDisputeSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Dispute Reason
                  </label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="WRONG_ITEM">Wrong item received</option>
                    <option value="DAMAGED">Damaged or defective item</option>
                    <option value="MISSING_ITEM">Item missing from package</option>
                    <option value="LATE_DELIVERY">Delivery was excessively delayed</option>
                    <option value="OTHER">Other issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Describe what happened
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Provide specific details about the issue with the item or delivery..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disputeLoading}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    {disputeLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>Submit Dispute</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
