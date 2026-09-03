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
  Filter,
  Search,
  Check,
  X,
  Eye,
} from "lucide-react";

interface SellerItem {
  _id: string;
  name: string;
  slug: string;
  phone: string;
  whatsappPhone?: string;
  verificationStatus: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";
  businessType: string;
  ghanaCardNumber: string;
  address: {
    area: string;
    pickupAddress: string;
    landmark?: string;
  };
  payoutInfo: {
    provider: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
}

export default function AdminSellersPage() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<SellerItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sellers");
      if (res.ok) {
        const data = await res.json();
        setSellers(data.sellers || []);
      }
    } catch (err) {
      console.error("Failed to load sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleStatusUpdate = async (
    sellerId: string,
    status: "VERIFIED" | "REJECTED"
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes: `Updated by Super Admin to ${status}`,
        }),
      });
      if (res.ok) {
        setSelectedSeller(null);
        fetchSellers();
      }
    } catch (err) {
      console.error("Failed to update seller status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSellers = sellers.filter((s) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "VERIFIED" && s.verificationStatus === "VERIFIED") ||
      (activeTab === "PENDING" &&
        (s.verificationStatus === "PENDING" || s.verificationStatus === "UNDER_REVIEW")) ||
      (activeTab === "REJECTED" && s.verificationStatus === "REJECTED");

    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.address.area.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Row matching UI Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sellers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamale merchant verification queue & onboarding governance
          </p>
        </div>
      </div>

      {/* Filter Tabs matching UI DESIGN.jpg reference */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
        {[
          { id: "ALL", label: "All" },
          { id: "PENDING", label: "Pending" },
          { id: "VERIFIED", label: "Approved" },
          { id: "REJECTED", label: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? "bg-dark-900 text-amber-400 font-black shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-card flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sellers by store name, area, phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Sellers Table matching UI Reference */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No merchants found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Store Name & Contact</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSellers.map((seller) => {
                  const isVerified = seller.verificationStatus === "VERIFIED";
                  const isPending =
                    seller.verificationStatus === "PENDING" ||
                    seller.verificationStatus === "UNDER_REVIEW";

                  return (
                    <tr key={seller._id} className="hover:bg-amber-50/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">
                            {seller.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{seller.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{seller.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {seller.address.area}, Tamale
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {new Date(seller.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4">
                        {isVerified ? (
                          <span className="inline-block text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                            Approved
                          </span>
                        ) : isPending ? (
                          <span className="inline-block text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-black bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSeller(seller)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                            title="View Verification Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(seller._id, "VERIFIED")}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Approve Seller"
                              >
                                <Check className="h-4 w-4 stroke-[3]" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(seller._id, "REJECTED")}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Reject Seller"
                              >
                                <X className="h-4 w-4 stroke-[3]" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seller Verification Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-elevated animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Seller Verification: {selectedSeller.name}
              </h3>
              <button
                onClick={() => setSelectedSeller(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ghana Card Identity</span>
                <p className="font-mono font-black text-slate-900 text-sm">
                  {selectedSeller.ghanaCardNumber || "GHA-726481920-1"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Physical Stall Address</span>
                <p className="font-bold text-slate-800">
                  {selectedSeller.address.pickupAddress} ({selectedSeller.address.area}, Tamale)
                </p>
                {selectedSeller.address.landmark && (
                  <p className="text-[10px] text-slate-500">Landmark: {selectedSeller.address.landmark}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Money Settlement</span>
                <p className="font-mono font-bold text-slate-800">
                  {selectedSeller.payoutInfo?.provider} • {selectedSeller.payoutInfo?.accountNumber} ({selectedSeller.payoutInfo?.accountName})
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStatusUpdate(selectedSeller._id, "REJECTED")}
                className="flex-1 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleStatusUpdate(selectedSeller._id, "VERIFIED")}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Approve Seller
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
