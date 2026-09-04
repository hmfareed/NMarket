"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  XCircle,
  MapPin,
  CreditCard,
  Loader2,
  Search,
  Check,
  X,
  Eye,
  Percent,
  Package,
  Phone,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface SellerItem {
  _id: string;
  name: string;
  slug: string;
  phone: string;
  whatsappPhone?: string;
  verificationStatus: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "SUSPENDED" | "REJECTED";
  commissionRate?: number;
  businessType: string;
  ghanaCardNumber: string;
  productCount?: number;
  adminNotes?: string;
  rejectedReason?: string;
  address: {
    area: string;
    pickupAddress: string;
    landmark?: string;
  };
  payoutInfo?: {
    provider: string;
    accountNumber: string;
    accountName: string;
  };
  performance?: {
    rating: number;
    totalOrders: number;
  };
  createdAt: string;
}

interface StoreProduct {
  _id: string;
  name: string;
  price: number;
  category: string;
  status: string;
  inventory: { available: number };
  images: { url: string }[];
}

export default function AdminSellersPage() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [counts, setCounts] = useState({
    pending: 0,
    underReview: 0,
    verified: 0,
    suspended: 0,
    rejected: 0,
    total: 0,
  });
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "VERIFIED" | "SUSPENDED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<SellerItem | null>(null);
  const [drawerProducts, setDrawerProducts] = useState<StoreProduct[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Drawer Form State
  const [drawerTab, setDrawerTab] = useState<"DETAILS" | "KYC" | "PRODUCTS">("DETAILS");
  const [editCommission, setEditCommission] = useState<number>(10);
  const [editNotes, setEditNotes] = useState<string>("");
  const [suspendReason, setSuspendReason] = useState<string>("");
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sellers${search ? `?q=${encodeURIComponent(search)}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setSellers(data.stores || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [search]);

  // Open store details drawer and load their products
  const handleOpenStoreDrawer = async (seller: SellerItem) => {
    setSelectedSeller(seller);
    setEditCommission(seller.commissionRate ?? 10);
    setEditNotes(seller.adminNotes || "");
    setDrawerTab("DETAILS");
    setDrawerLoading(true);

    try {
      const res = await fetch(`/api/admin/sellers/${seller._id}`);
      if (res.ok) {
        const data = await res.json();
        setDrawerProducts(data.products || []);
      }
    } catch (e) {
      console.error("Failed to load store products:", e);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleUpdateStore = async (statusOverride?: "VERIFIED" | "SUSPENDED" | "REJECTED") => {
    if (!selectedSeller) return;
    setActionLoading(true);

    try {
      const payload: Record<string, any> = {
        commissionRate: Number(editCommission),
        adminNotes: editNotes,
      };

      if (statusOverride) {
        payload.verificationStatus = statusOverride;
        if (statusOverride === "SUSPENDED") {
          payload.rejectedReason = suspendReason || "Suspended by Administrator";
        }
      }

      const res = await fetch(`/api/admin/sellers/${selectedSeller._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowSuspendModal(false);
        setSuspendReason("");
        // Reload sellers and update selected store state
        await fetchSellers();
        setSelectedSeller((prev) =>
          prev
            ? {
                ...prev,
                verificationStatus: statusOverride || prev.verificationStatus,
                commissionRate: Number(editCommission),
                adminNotes: editNotes,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Failed to update store:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSellers = sellers.filter((s) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PENDING") {
      return s.verificationStatus === "PENDING" || s.verificationStatus === "UNDER_REVIEW";
    }
    return s.verificationStatus === activeTab;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Store & Seller Management</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
              Tamale Merchants
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage store verifications, Ghana Card KYC, custom commission rates, and suspensions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSellers}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stores</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{counts.total || sellers.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active & Verified</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{counts.verified}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending KYC</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {(counts.pending || 0) + (counts.underReview || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Suspended Stores</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{counts.suspended || 0}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "All Stores", count: counts.total },
              { id: "PENDING", label: "Pending KYC", count: (counts.pending || 0) + (counts.underReview || 0) },
              { id: "VERIFIED", label: "Verified", count: counts.verified },
              { id: "SUSPENDED", label: "Suspended", count: counts.suspended },
              { id: "REJECTED", label: "Rejected", count: counts.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-dark-900 text-emerald-400 font-black shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.id
                        ? "bg-emerald-400 text-slate-950 font-black"
                        : "bg-slate-100 text-slate-600 font-bold"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search store, phone, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Store className="h-10 w-10 text-slate-200 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No stores found</p>
            <p className="text-[11px] text-slate-400">Try adjusting your status filter or search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Store & Merchant</th>
                  <th className="py-3 px-4">Tamale Location</th>
                  <th className="py-3 px-4">Catalog</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Rating & Orders</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSellers.map((seller) => {
                  const isVerified = seller.verificationStatus === "VERIFIED";
                  const isPending = seller.verificationStatus === "PENDING" || seller.verificationStatus === "UNDER_REVIEW";
                  const isSuspended = seller.verificationStatus === "SUSPENDED";

                  return (
                    <tr key={seller._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Store & Merchant */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                            {seller.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 flex items-center gap-1">
                              <span>{seller.name}</span>
                              {isVerified && <ShieldCheck className="h-3 w-3 text-emerald-500 fill-emerald-50" />}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{seller.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{seller.address?.area || "Tamale Central"}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {seller.address?.pickupAddress || "Near Central Market"}
                        </p>
                      </td>

                      {/* Catalog */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {seller.productCount || 0} products
                      </td>

                      {/* Commission */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-0.5 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-[11px]">
                          <Percent className="h-2.5 w-2.5" />
                          <span>{seller.commissionRate ?? 10}%</span>
                        </span>
                      </td>

                      {/* Performance */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">★ {seller.performance?.rating?.toFixed(1) || "5.0"}</p>
                        <p className="text-[10px] text-slate-400">{seller.performance?.totalOrders || 0} orders</p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            <Clock className="h-3 w-3" />
                            <span>Pending KYC</span>
                          </span>
                        )}
                        {isSuspended && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                            <AlertCircle className="h-3 w-3" />
                            <span>Suspended</span>
                          </span>
                        )}
                        {seller.verificationStatus === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            <XCircle className="h-3 w-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenStoreDrawer(seller)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-dark-900 hover:bg-slate-800 text-emerald-400 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Manage</span>
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

      {/* STORE MANAGEMENT DRAWER */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedSeller(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between">
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {selectedSeller.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                      <span>{selectedSeller.name}</span>
                      {selectedSeller.verificationStatus === "VERIFIED" && (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </h2>
                    <p className="text-[11px] text-slate-400 truncate">
                      {selectedSeller.address?.area} • Member since {new Date(selectedSeller.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSeller(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex items-center border-b border-slate-100 px-5 gap-4 text-xs font-bold bg-white">
                <button
                  type="button"
                  onClick={() => setDrawerTab("DETAILS")}
                  className={`py-3 border-b-2 transition ${
                    drawerTab === "DETAILS"
                      ? "border-emerald-600 text-slate-900 font-black"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Store Profile & Terms
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("KYC")}
                  className={`py-3 border-b-2 transition ${
                    drawerTab === "KYC"
                      ? "border-emerald-600 text-slate-900 font-black"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Ghana Card KYC
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("PRODUCTS")}
                  className={`py-3 border-b-2 transition ${
                    drawerTab === "PRODUCTS"
                      ? "border-emerald-600 text-slate-900 font-black"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Products ({drawerProducts.length})
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {drawerTab === "DETAILS" && (
                  <div className="space-y-4">
                    {/* Operating Status Banner */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Verification Status</p>
                        <p className="text-xs font-black text-slate-900 mt-0.5">
                          {selectedSeller.verificationStatus}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {selectedSeller.verificationStatus !== "VERIFIED" && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleUpdateStore("VERIFIED")}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                          >
                            Approve Store
                          </button>
                        )}
                        {selectedSeller.verificationStatus === "VERIFIED" && (
                          <button
                            type="button"
                            onClick={() => setShowSuspendModal(true)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
                          >
                            Suspend Store
                          </button>
                        )}
                        {selectedSeller.verificationStatus === "SUSPENDED" && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleUpdateStore("VERIFIED")}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-xs"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Commercial Terms: Custom Commission Override */}
                    <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-black text-emerald-950 flex items-center gap-1">
                            <Percent className="h-3 w-3 text-emerald-600" />
                            <span>Marketplace Commission Rate</span>
                          </label>
                          <p className="text-[11px] text-emerald-800/80">
                            Standard rate is 10.0%. You can apply promotional or volume rates for this seller.
                          </p>
                        </div>
                        <span className="text-base font-black text-emerald-950 font-mono">
                          {editCommission}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="0.5"
                          value={editCommission}
                          onChange={(e) => setEditCommission(Number(e.target.value))}
                          className="w-full accent-emerald-600"
                        />
                        <div className="flex gap-1">
                          {[5, 8, 10, 12].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setEditCommission(preset)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                                editCommission === preset
                                  ? "bg-emerald-600 text-white border-emerald-600 font-black"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {preset}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Contact & Location */}
                    <div className="space-y-3 bg-white rounded-2xl p-4 border border-slate-200">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Contact & Physical Address
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Phone (MoMo):</span>
                          <span className="font-bold text-slate-800">{selectedSeller.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">WhatsApp:</span>
                          <span className="font-bold text-slate-800">{selectedSeller.whatsappPhone || selectedSeller.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Tamale Zone:</span>
                          <span className="font-bold text-slate-800">{selectedSeller.address?.area}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Landmark:</span>
                          <span className="font-bold text-slate-800">{selectedSeller.address?.landmark || "N/A"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 text-[10px] block">Exact Pickup Address:</span>
                          <span className="font-bold text-slate-800">{selectedSeller.address?.pickupAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Internal Admin Audit Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-900">
                        Admin Audit Notes
                      </label>
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="e.g. Verified in person by Tamale field agent. Premium smocks supplier."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                )}

                {drawerTab === "KYC" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Ghana Card Verification
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black font-mono text-slate-900 tracking-wider">
                            {selectedSeller.ghanaCardNumber || "GHA-XXXXXXXXX-X"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Registered entity: {selectedSeller.businessType}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200">
                          Ghana Identity Verified
                        </span>
                      </div>
                    </div>

                    {/* Payout Details */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Mobile Money Payout Account
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {selectedSeller.payoutInfo?.provider || "MTN_MOMO"}
                          </p>
                          <p className="text-xs font-mono font-bold text-slate-700">
                            {selectedSeller.payoutInfo?.accountNumber || selectedSeller.phone}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Account Name: {selectedSeller.payoutInfo?.accountName || selectedSeller.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === "PRODUCTS" && (
                  <div className="space-y-3">
                    {drawerLoading ? (
                      <div className="py-12 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                      </div>
                    ) : drawerProducts.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">
                        This merchant has not listed any products yet.
                      </div>
                    ) : (
                      drawerProducts.map((p) => (
                        <div
                          key={p._id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1544441893-675973e31985?w=100"}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.category} • Stock: {p.inventory?.available}</p>
                            </div>
                          </div>
                          <span className="font-black font-mono text-slate-900">
                            {formatGHS(p.price)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSeller(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStore()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  <span>Save Store Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND STORE MODAL */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Suspend Store: {selectedSeller?.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Suspending this store will immediately unpublish all their products from customer discovery in Tamale.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reason for Suspension</label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Failure to fulfill orders within agreed timeframe or counterfeit products reported."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStore("SUSPENDED")}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm Suspension</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
