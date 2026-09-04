"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  Loader2,
  Package,
  MapPin,
  Phone,
  User,
  X,
  Check,
  RefreshCw,
  Store,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface OrderItem {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "PICKED_UP" | "DELIVERED" | "CANCELLED";
  paymentStatus: string;
  customerSnapshot?: {
    name: string;
    phone: string;
  };
  deliveryAddress: {
    area: string;
    addressText: string;
    landmark?: string;
    deliveryInstructions?: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    storeName?: string;
  }[];
  sellerOrders?: {
    storeId: string;
    storeName: string;
    subtotal: number;
  }[];
  assignedRiderId?: {
    _id: string;
    phone: string;
    riderProfile?: {
      fullName: string;
      vehicleType: string;
    };
  };
  deliveryOtp?: {
    code: string;
    isVerified: boolean;
  };
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    pickedUp: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        await fetchOrders();
        setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus as any } : null));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>Delivered</span>
          </span>
        );
      case "PICKED_UP":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
            <Truck className="h-3 w-3" />
            <span>Out for Delivery</span>
          </span>
        );
      case "PREPARING":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
            <Package className="h-3 w-3" />
            <span>Preparing</span>
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
            <Clock className="h-3 w-3" />
            <span>Confirmed</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
            <AlertCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Global Orders Fulfillment</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
              Tamale Metro
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time fulfillment across all Tamale stores, dispatch riders, and verify delivery handshakes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Total Orders</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 truncate" title={String(counts.total || orders.length)}>
            {counts.total || orders.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider truncate">In Fulfillment</p>
          <p
            className="text-xl sm:text-2xl font-black text-amber-600 mt-1 truncate"
            title={String((counts.confirmed || 0) + (counts.preparing || 0) + (counts.pickedUp || 0))}
          >
            {(counts.confirmed || 0) + (counts.preparing || 0) + (counts.pickedUp || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider truncate">Delivered</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 truncate" title={String(counts.delivered)}>
            {counts.delivered}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs min-w-0 overflow-hidden">
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider truncate">Cancelled / Refunded</p>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1 truncate" title={String(counts.cancelled)}>
            {counts.cancelled}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "All Orders" },
              { id: "PENDING", label: "Pending" },
              { id: "CONFIRMED", label: "Confirmed" },
              { id: "PREPARING", label: "Preparing" },
              { id: "PICKED_UP", label: "Out for Delivery" },
              { id: "DELIVERED", label: "Delivered" },
              { id: "CANCELLED", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-dark-900 text-emerald-400 font-black shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search order #, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ShoppingBag className="h-10 w-10 text-slate-200 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Tamale Destination</th>
                  <th className="py-3 px-4">Store / Merchant</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => {
                  const customerName = o.customerSnapshot?.name || "Customer";
                  const storeName =
                    o.sellerOrders?.[0]?.storeName || o.items?.[0]?.storeName || "Tamale Merchant";

                  return (
                    <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order # */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{customerName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {o.customerSnapshot?.phone || "024XXXXXXX"}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{o.deliveryAddress?.area || "Tamale Central"}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {o.deliveryAddress?.landmark || o.deliveryAddress?.addressText || "Tamale"}
                        </p>
                      </td>

                      {/* Store */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">{storeName}</span>
                        <span className="text-[10px] text-slate-400 block">{o.items?.length || 1} items</span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        {formatGHS(o.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">{getStatusBadge(o.status)}</td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-dark-900 hover:bg-slate-800 text-emerald-400 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Fulfill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER FULFILLMENT DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Order #{selectedOrder.orderNumber}</span>
                    {getStatusBadge(selectedOrder.status)}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* Delivery Handshake Status (Release Guard) */}
                <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="font-black text-emerald-950">Tamale Delivery OTP Handshake</p>
                      <p className="text-[10px] text-emerald-800">
                        {selectedOrder.deliveryOtp?.isVerified
                          ? "✓ Verified by customer on delivery"
                          : "Pending 6-digit confirmation code on doorstep"}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.deliveryOtp?.code && (
                    <span className="font-mono font-black text-sm bg-white text-slate-900 px-2 py-1 rounded-lg border border-emerald-200">
                      {selectedOrder.deliveryOtp.code}
                    </span>
                  )}
                </div>

                {/* Customer & Tamale Address */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Customer & Destination
                  </p>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{selectedOrder.customerSnapshot?.name || "Customer"}</p>
                    <p className="text-slate-600 font-mono">{selectedOrder.customerSnapshot?.phone}</p>
                    <p className="text-slate-800 font-medium pt-1">
                      📍 {selectedOrder.deliveryAddress?.area} • {selectedOrder.deliveryAddress?.addressText}
                    </p>
                    {selectedOrder.deliveryAddress?.landmark && (
                      <p className="text-slate-500 text-[11px]">
                        Landmark: {selectedOrder.deliveryAddress.landmark}
                      </p>
                    )}
                    {selectedOrder.deliveryAddress?.deliveryInstructions && (
                      <p className="text-emerald-800 bg-emerald-50 p-2 rounded-lg text-[10px] border border-emerald-200">
                        Instructions: &ldquo;{selectedOrder.deliveryAddress.deliveryInstructions}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Order Items ({selectedOrder.items?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.imageUrl || "https://images.unsplash.com/photo-1544441893-675973e31985?w=100"}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Qty: {item.quantity} × {formatGHS(item.price)}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {formatGHS(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Summary */}
                  <div className="pt-2 space-y-1 text-slate-500">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatGHS(selectedOrder.subtotal || selectedOrder.totalAmount - 10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-mono">{formatGHS(selectedOrder.deliveryFee || 10)}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-100">
                      <span>Total Amount</span>
                      <span className="font-mono text-emerald-600">{formatGHS(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Transitions */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Fulfillment Status Override
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOrder.status !== "CONFIRMED" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(selectedOrder._id, "CONFIRMED")}
                        className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 transition"
                      >
                        Confirm Order
                      </button>
                    )}
                    {selectedOrder.status !== "PREPARING" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(selectedOrder._id, "PREPARING")}
                        className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-amber-700 transition"
                      >
                        Mark Preparing
                      </button>
                    )}
                    {selectedOrder.status !== "PICKED_UP" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(selectedOrder._id, "PICKED_UP")}
                        className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-blue-700 transition"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {selectedOrder.status !== "DELIVERED" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus(selectedOrder._id, "DELIVERED")}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition"
                      >
                        Mark Delivered ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "DELIVERED" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder._id, "CANCELLED")}
                    className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    Cancel & Refund Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
