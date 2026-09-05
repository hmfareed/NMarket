"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronRight,
  ShieldCheck,
  User,
  Zap,
  RefreshCw,
  X,
  Check,
  Loader2,
  ArrowRight,
  Eye,
  Bike,
  ExternalLink,
  Store,
  KeyRound,
  Radio,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface DeliveryItem {
  _id: string;
  orderId?: {
    _id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
  };
  orderNumber: string;
  sellerOrderId: string;
  riderId?: {
    _id: string;
    customerProfile?: { firstName: string; lastName: string };
    riderProfile?: {
      vehicleType: string;
      licensePlate?: string;
      operatingZone?: string;
      isOnline?: boolean;
      rating?: number;
    };
    phone: string;
    email: string;
  };
  pickupLocation: {
    storeName: string;
    area: string;
    address: string;
    phone: string;
    coordinates?: [number, number];
  };
  dropoffLocation: {
    recipient: string;
    phone: string;
    area: string;
    address: string;
    landmark?: string;
    deliveryInstructions?: string;
    coordinates?: [number, number];
  };
  status: "PENDING_DISPATCH" | "ACCEPTED" | "PICKED_UP" | "DELIVERED" | "FAILED" | "CANCELLED";
  deliveryFee: number;
  deliveryOtp: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FleetRider {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  isOnline: boolean;
  vehicleType: "MOTORCYCLE" | "TRICYCLE" | "BICYCLE";
  licensePlate: string;
  operatingZone: string;
  rating: number;
  totalCompletedDeliveries: number;
  currentEarnings: number;
  activeJobId: string | null;
  activeOrderNumber: string | null;
}

interface FleetStats {
  activeDeliveries: number;
  pendingPickups: number;
  deliveredToday: number;
  cancelledCount: number;
  totalDeliveries: number;
  onlineRidersCount: number;
  totalRidersCount: number;
}

export default function DeliveryCommandCenterPage() {
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [riders, setRiders] = useState<FleetRider[]>([]);
  const [stats, setStats] = useState<FleetStats>({
    activeDeliveries: 0,
    pendingPickups: 0,
    deliveredToday: 0,
    cancelledCount: 0,
    totalDeliveries: 0,
    onlineRidersCount: 0,
    totalRidersCount: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Inspection Drawer
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);

  // Dispatch / Reassignment Modal
  const [dispatchDelivery, setDispatchDelivery] = useState<DeliveryItem | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchDeliveryData = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== "ALL") queryParams.set("status", statusFilter);
      if (search.trim()) queryParams.set("search", search.trim());

      const res = await fetch(`/api/admin/delivery?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries || []);
        setRiders(data.riders || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load admin delivery data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDeliveryData();
  };

  const handleOpenDispatch = (delivery: DeliveryItem) => {
    setDispatchDelivery(delivery);
    setSelectedRiderId(
      delivery.riderId?._id || (riders.find((r) => r.isOnline)?._id || "")
    );
    setDispatchNotes(delivery.notes || "");
    setDispatchError(null);
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchDelivery || !selectedRiderId) {
      setDispatchError("Please select a rider to dispatch.");
      return;
    }

    setDispatchLoading(true);
    setDispatchError(null);

    try {
      const res = await fetch("/api/admin/delivery/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryId: dispatchDelivery._id,
          riderId: selectedRiderId,
          notes: dispatchNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDispatchError(data.error || "Failed to dispatch rider.");
        return;
      }

      setSuccessToast(data.message || "Rider dispatched successfully!");
      setDispatchDelivery(null);
      fetchDeliveryData();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      setDispatchError("Network error during rider dispatch.");
    } finally {
      setDispatchLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_DISPATCH":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Dispatch
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Rider Assigned
          </span>
        );
      case "PICKED_UP":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            In Transit
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Delivered (OTP Verified)
          </span>
        );
      case "CANCELLED":
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case "TRICYCLE":
        return "🛺";
      case "BICYCLE":
        return "🚲";
      default:
        return "🏍️";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Delivery Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
              Tamale Fleet
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial dispatch, rider tracking, and verified OTP fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition"
          >
            <span>Orders Command</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Deliveries */}
        <div
          onClick={() => setStatusFilter("PICKED_UP")}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-1 min-w-0 overflow-hidden cursor-pointer hover:border-blue-300 transition"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 gap-2 min-w-0">
            <span className="truncate">Active In Transit</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {stats.activeDeliveries}
          </p>
          <p className="text-[10px] text-slate-400 truncate">Parcels on the road</p>
        </div>

        {/* Pending Pickups */}
        <div
          onClick={() => setStatusFilter("PENDING_DISPATCH")}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-1 min-w-0 overflow-hidden cursor-pointer hover:border-amber-300 transition"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 gap-2 min-w-0">
            <span className="truncate">Pending Dispatch</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight truncate">
            {stats.pendingPickups}
          </p>
          <p className="text-[10px] text-slate-400 truncate">Requires rider assignment</p>
        </div>

        {/* Delivered Today */}
        <div
          onClick={() => setStatusFilter("DELIVERED")}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-1 min-w-0 overflow-hidden cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 gap-2 min-w-0">
            <span className="truncate">Delivered Today</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight truncate">
            {stats.deliveredToday}
          </p>
          <p className="text-[10px] text-slate-400 truncate">Secured with 4-digit OTP</p>
        </div>

        {/* Fleet Online */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 gap-2 min-w-0">
            <span className="truncate">Fleet Active</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Online
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {stats.onlineRidersCount} <span className="text-xs font-bold text-slate-400">/ {stats.totalRidersCount} riders</span>
          </p>
          <p className="text-[10px] text-slate-400 truncate">Ready for dispatch in Tamale</p>
        </div>
      </div>

      {/* Split View: Left Column (Map & Fleet) + Right Column (Deliveries List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Map & Registered Fleet */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tamale Fleet Map Canvas */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  <span>Tamale Metropolitan Fleet Dispatch</span>
                </h2>
                <p className="text-[11px] text-slate-400">Live operational nodes & active delivery corridors</p>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                Zone 1 & 2 Active
              </span>
            </div>

            {/* Interactive Map Visual */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-between min-h-[300px]">
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

              {/* Pulsing Tamale Landmark Nodes with real counts */}
              <div className="absolute top-[20%] left-[25%] flex flex-col items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-blue-500/30 animate-pulse" />
                <span className="text-[9px] font-black text-blue-200 bg-dark-900/90 px-1.5 py-0.5 rounded shadow-xs">
                  Sakasaka
                </span>
              </div>

              <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-400 ring-6 ring-blue-400/40 animate-pulse" />
                <span className="text-[10px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  <Store className="w-2.5 h-2.5" />
                  Tamale Central Hub
                </span>
              </div>

              <div className="absolute bottom-[25%] left-[30%] flex flex-col items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-400 ring-4 ring-indigo-400/30 animate-pulse" />
                <span className="text-[9px] font-black text-indigo-200 bg-dark-900/90 px-1.5 py-0.5 rounded shadow-xs">
                  Lamashegu Market
                </span>
              </div>

              <div className="absolute top-[28%] right-[22%] flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-200 bg-dark-900/90 px-1.5 py-0.5 rounded shadow-xs">
                  Aboabo Market
                </span>
              </div>

              <div className="absolute bottom-[20%] right-[25%] flex flex-col items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 ring-4 ring-amber-400/30 animate-pulse" />
                <span className="text-[9px] font-black text-amber-200 bg-dark-900/90 px-1.5 py-0.5 rounded shadow-xs">
                  Vittin Estates
                </span>
              </div>

              <div className="absolute top-[18%] left-[10%] flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-400 ring-4 ring-blue-400/30 animate-pulse" />
                <span className="text-[9px] font-black text-blue-200 bg-dark-900/90 px-1.5 py-0.5 rounded shadow-xs">
                  Sagnarigu
                </span>
              </div>

              {/* Floating Bottom Status Bar */}
              <div className="relative z-10 w-full mt-auto p-3 bg-dark-900/90 backdrop-blur-md rounded-xl border border-dark-800 text-center flex items-center justify-between text-slate-300 text-xs">
                <div className="flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-white">Geospatial Haversine Dispatch Active</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> In Transit ({stats.activeDeliveries})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending ({stats.pendingPickups})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Fleet Roster */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Bike className="h-4 w-4 text-blue-600" />
                  <span>Tamale Fleet Roster ({riders.length})</span>
                </h2>
                <p className="text-[11px] text-slate-400">Active rider partners, vehicles & availability</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {stats.onlineRidersCount} Online Now
              </span>
            </div>

            {riders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No riders registered in fleet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {riders.map((rider) => (
                  <div
                    key={rider._id}
                    className="p-3 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-slate-50/50 space-y-2 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getVehicleIcon(rider.vehicleType)}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 truncate">{rider.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{rider.operatingZone}</p>
                        </div>
                      </div>
                      <span
                        className={`w-2 h-2 rounded-full ${rider.isOnline ? "bg-emerald-500" : "bg-slate-300"}`}
                        title={rider.isOnline ? "Online" : "Offline"}
                      />
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>{rider.phone}</span>
                      <span className="font-bold text-slate-700">⭐ {rider.rating.toFixed(1)}</span>
                    </div>

                    <div className="text-[9px] text-slate-400 flex items-center justify-between">
                      <span>{rider.totalCompletedDeliveries} trips</span>
                      {rider.activeOrderNumber ? (
                        <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          #{rider.activeOrderNumber}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Free</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Real Deliveries Dispatch Feed */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header & Status Filter Pills */}
            <div className="space-y-3 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Delivery Dispatch Stream</h2>
                  <p className="text-[11px] text-slate-400">Live parcels and rider allocations</p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {deliveries.length} items
                </span>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
                {[
                  { id: "ALL", label: "All" },
                  { id: "PENDING_DISPATCH", label: "Needs Rider" },
                  { id: "ACCEPTED", label: "Assigned" },
                  { id: "PICKED_UP", label: "In Transit" },
                  { id: "DELIVERED", label: "Delivered" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                      statusFilter === tab.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search order #, customer, area, rider..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 transition"
                />
              </div>
            </div>

            {/* Delivery Items List */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-xs">Loading live fleet deliveries...</span>
              </div>
            ) : deliveries.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Truck className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No deliveries found</p>
                <p className="text-[11px] text-slate-400">
                  {statusFilter !== "ALL" ? `No deliveries with status "${statusFilter}".` : "No active deliveries in Tamale."}
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[640px] pr-1">
                {deliveries.map((delivery) => {
                  const rider = delivery.riderId;
                  const riderName =
                    `${rider?.customerProfile?.firstName || ""} ${rider?.customerProfile?.lastName || ""}`.trim() ||
                    "Unassigned";

                  return (
                    <div
                      key={delivery._id}
                      className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-blue-300 bg-white shadow-xs space-y-2.5 transition"
                    >
                      {/* Top row: Order # and Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900">
                            #{delivery.orderNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {delivery.sellerOrderId}
                          </span>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>

                      {/* Route row: Pickup -> Dropoff */}
                      <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate">
                              {delivery.pickupLocation.storeName}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {delivery.pickupLocation.area} · {delivery.pickupLocation.address}
                            </p>
                          </div>
                        </div>

                        <div className="border-l-2 border-dashed border-slate-200 ml-1 h-2 my-0.5" />

                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate">
                              {delivery.dropoffLocation.recipient} ({delivery.dropoffLocation.phone})
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {delivery.dropoffLocation.area} · {delivery.dropoffLocation.address}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom row: Rider info & Actions */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-2">
                          {delivery.riderId ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">
                                {getVehicleIcon(rider?.riderProfile?.vehicleType || "MOTORCYCLE")}
                              </span>
                              <div>
                                <p className="text-[11px] font-bold text-slate-800">{riderName}</p>
                                <a
                                  href={`tel:${rider?.phone}`}
                                  className="text-[10px] text-blue-600 hover:underline"
                                >
                                  {rider?.phone}
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              ⚠️ No Rider Assigned
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedDelivery(delivery)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect</span>
                          </button>

                          {delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED" && (
                            <button
                              onClick={() => handleOpenDispatch(delivery)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-xs"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>{delivery.riderId ? "Reassign" : "Dispatch"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/admin/orders"
            className="w-full text-center text-xs font-bold text-slate-600 hover:text-blue-600 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition block mt-4"
          >
            View all order fulfillment records →
          </Link>
        </div>
      </div>

      {/* DISPATCH / REASSIGN RIDER MODAL */}
      {dispatchDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  <span>Dispatch Rider Partner</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Order #{dispatchDelivery.orderNumber} ({dispatchDelivery.sellerOrderId})
                </p>
              </div>
              <button
                onClick={() => setDispatchDelivery(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {dispatchError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{dispatchError}</span>
              </div>
            )}

            {/* Quick Route Summary */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Pickup:</span>
                <strong className="text-slate-800">
                  {dispatchDelivery.pickupLocation.storeName} ({dispatchDelivery.pickupLocation.area})
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Dropoff:</span>
                <strong className="text-slate-800">
                  {dispatchDelivery.dropoffLocation.recipient} ({dispatchDelivery.dropoffLocation.area})
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Delivery Fee:</span>
                <strong className="text-blue-700">{formatGHS(dispatchDelivery.deliveryFee)}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Registered Fleet Rider
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {riders.map((r) => {
                    const isSelected = selectedRiderId === r._id;
                    return (
                      <label
                        key={r._id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="rider"
                            value={r._id}
                            checked={isSelected}
                            onChange={() => setSelectedRiderId(r._id)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{getVehicleIcon(r.vehicleType)}</span>
                              <span>{r.name}</span>
                              {r.isOnline ? (
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">
                                  ONLINE
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-slate-400">OFFLINE</span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {r.phone} · {r.operatingZone} · ⭐ {r.rating.toFixed(1)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-[10px]">
                          {r.activeOrderNumber ? (
                            <span className="text-amber-600 font-bold">1 active trip</span>
                          ) : (
                            <span className="text-emerald-600 font-bold">Available</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dispatch Instructions (Optional)
                </label>
                <textarea
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="e.g. Priority dispatch, fragile packages, call store on arrival"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none focus:border-blue-400 resize-none h-16"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchDelivery(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchLoading || !selectedRiderId}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  {dispatchLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Confirm Dispatch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELIVERY INSPECT SLIDE-OVER DRAWER */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Top Drawer Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span>Delivery Inspection</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    #{selectedDelivery.orderNumber} · {selectedDelivery.sellerOrderId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status & OTP pill */}
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedDelivery.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery OTP</p>
                  <div className="flex items-center gap-1 mt-1 justify-end font-mono text-xs font-black text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <KeyRound className="h-3 w-3 text-amber-500" />
                    <span>{selectedDelivery.deliveryOtp || "Pending"}</span>
                  </div>
                </div>
              </div>

              {/* Store Pickup Location */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-blue-600" />
                  <span>Merchant Pickup</span>
                </h3>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <p className="font-bold text-slate-900">{selectedDelivery.pickupLocation.storeName}</p>
                  <p className="text-slate-500">{selectedDelivery.pickupLocation.address}</p>
                  <p className="text-[11px] text-slate-400">Area: {selectedDelivery.pickupLocation.area}</p>
                  <a
                    href={`tel:${selectedDelivery.pickupLocation.phone}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{selectedDelivery.pickupLocation.phone}</span>
                  </a>
                </div>
              </div>

              {/* Customer Dropoff Location */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Customer Destination</span>
                </h3>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <p className="font-bold text-slate-900">{selectedDelivery.dropoffLocation.recipient}</p>
                  <p className="text-slate-500">{selectedDelivery.dropoffLocation.address}</p>
                  <p className="text-[11px] text-slate-400">Area: {selectedDelivery.dropoffLocation.area}</p>
                  {selectedDelivery.dropoffLocation.landmark && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      📍 Landmark: {selectedDelivery.dropoffLocation.landmark}
                    </p>
                  )}
                  {selectedDelivery.dropoffLocation.deliveryInstructions && (
                    <p className="text-[11px] text-slate-600 italic">
                      Instructions: "{selectedDelivery.dropoffLocation.deliveryInstructions}"
                    </p>
                  )}
                  <a
                    href={`tel:${selectedDelivery.dropoffLocation.phone}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{selectedDelivery.dropoffLocation.phone}</span>
                  </a>
                </div>
              </div>

              {/* Assigned Rider Info */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Bike className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Assigned Fleet Rider</span>
                </h3>
                {selectedDelivery.riderId ? (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{getVehicleIcon(selectedDelivery.riderId.riderProfile?.vehicleType || "MOTORCYCLE")}</span>
                        <span>
                          {selectedDelivery.riderId.customerProfile?.firstName}{" "}
                          {selectedDelivery.riderId.customerProfile?.lastName}
                        </span>
                      </p>
                      <span className="text-[10px] font-bold text-slate-600">
                        {selectedDelivery.riderId.riderProfile?.licensePlate || "M-24-NR"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Zone: {selectedDelivery.riderId.riderProfile?.operatingZone || "Tamale"}
                    </p>
                    <a
                      href={`tel:${selectedDelivery.riderId.phone}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-1"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{selectedDelivery.riderId.phone}</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
                    No rider assigned yet. Click "Dispatch Rider" below.
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <p>Created: {new Date(selectedDelivery.createdAt).toLocaleString()}</p>
                {selectedDelivery.assignedAt && (
                  <p>Assigned: {new Date(selectedDelivery.assignedAt).toLocaleString()}</p>
                )}
                {selectedDelivery.pickedUpAt && (
                  <p>Picked Up: {new Date(selectedDelivery.pickedUpAt).toLocaleString()}</p>
                )}
                {selectedDelivery.deliveredAt && (
                  <p className="text-emerald-600 font-bold">
                    Delivered: {new Date(selectedDelivery.deliveredAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              {selectedDelivery.status !== "DELIVERED" && selectedDelivery.status !== "CANCELLED" && (
                <button
                  onClick={() => {
                    handleOpenDispatch(selectedDelivery);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>{selectedDelivery.riderId ? "Reassign Rider" : "Dispatch Rider"}</span>
                </button>
              )}

              <button
                onClick={() => setSelectedDelivery(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
