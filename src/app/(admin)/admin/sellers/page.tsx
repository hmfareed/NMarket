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
  businessRegistrationNumber?: string;
  address: {
    region: string;
    city: string;
    area: string;
    pickupAddress: string;
    landmark?: string;
  };
  payoutInfo: {
    provider: string;
    accountNumber: string;
    accountName: string;
  };
  sellerId?: {
    customerProfile?: {
      firstName: string;
      lastName: string;
    };
    phone: string;
    email?: string;
    createdAt: string;
  };
  createdAt: string;
  adminNotes?: string;
  rejectedReason?: string;
}

export default function AdminSellersPage() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [filter, setFilter] = useState("PENDING");
  const [counts, setCounts] = useState({
    pending: 0,
    underReview: 0,
    verified: 0,
    rejected: 0,
    total: 0,
  });

  const [selectedSeller, setSelectedSeller] = useState<SellerItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sellers?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setSellers(data.stores);
        setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [filter]);

  const handleReviewAction = async (action: "APPROVE" | "REJECT" | "REQUEST_CHANGES") => {
    if (!selectedSeller) return;
    setActionLoading(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/sellers/${selectedSeller._id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminNotes,
          rejectedReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process review.");
      }

      setActionSuccess(data.message);
      setTimeout(() => {
        setSelectedSeller(null);
        setAdminNotes("");
        setRejectedReason("");
        setActionSuccess(null);
        fetchSellers();
      }, 1000);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg">
                N
              </div>
              <span className="font-bold text-white text-base">NMarket Admin</span>
            </Link>
            <span className="text-slate-500 text-sm">/</span>
            <span className="text-xs text-emerald-400 font-medium">
              Seller Verifications
            </span>
          </div>
          <Link
            href="/admin"
            className="text-xs text-slate-400 hover:text-white transition font-medium"
          >
            ← Overview Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Seller Verification Queue
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review and verify merchant identity, Tamale pickup stalls, and MoMo payout wallets
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400 ml-2" />
            {[
              { key: "PENDING", label: `Pending (${counts.pending})` },
              { key: "VERIFIED", label: `Verified (${counts.verified})` },
              { key: "REJECTED", label: `Rejected (${counts.rejected})` },
              { key: "ALL", label: `All (${counts.total})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  filter === tab.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 flex justify-center items-center text-slate-400 gap-2 text-xs">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <span>Loading applications...</span>
            </div>
          ) : sellers.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <Store className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <span>No seller applications found in this status filter.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Store Name</th>
                    <th className="py-3 px-4">Merchant Name</th>
                    <th className="py-3 px-4">Tamale Location</th>
                    <th className="py-3 px-4">Ghana Card</th>
                    <th className="py-3 px-4">MoMo Payout</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sellers.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{s.phone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-semibold block">
                          {s.sellerId?.customerProfile?.firstName} {s.sellerId?.customerProfile?.lastName}
                        </span>
                        <span className="text-[11px] text-slate-400">{s.sellerId?.email || s.sellerId?.phone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-bold block">{s.address.area}</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                          {s.address.pickupAddress}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {s.ghanaCardNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{s.payoutInfo.accountNumber}</span>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          {s.payoutInfo.provider} ({s.payoutInfo.accountName})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            s.verificationStatus === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.verificationStatus === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {s.verificationStatus === "VERIFIED" && <CheckCircle2 className="h-3 w-3" />}
                          {s.verificationStatus === "PENDING" && <Clock className="h-3 w-3" />}
                          {s.verificationStatus === "REJECTED" && <XCircle className="h-3 w-3" />}
                          <span>{s.verificationStatus}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSeller(s);
                            setAdminNotes(s.adminNotes || "");
                            setRejectedReason(s.rejectedReason || "");
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedSeller.name}</h3>
                <p className="text-xs text-slate-500">
                  Application ID: <span className="font-mono">{selectedSeller._id}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant Name:</span>
                  <span className="font-bold text-slate-900">
                    {selectedSeller.sellerId?.customerProfile?.firstName} {selectedSeller.sellerId?.customerProfile?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-bold text-slate-900">{selectedSeller.phone} (WA: {selectedSeller.whatsappPhone || "N/A"})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ghana Card ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedSeller.ghanaCardNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tamale Community:</span>
                  <span className="font-bold text-slate-900">{selectedSeller.address.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Address:</span>
                  <span className="font-bold text-slate-900">{selectedSeller.address.pickupAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MoMo Wallet:</span>
                  <span className="font-bold text-slate-900">
                    {selectedSeller.payoutInfo.provider} — {selectedSeller.payoutInfo.accountNumber} ({selectedSeller.payoutInfo.accountName})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Audit Note
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Ghana Card verified against national database"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rejection Reason (If rejecting)
                </label>
                <input
                  type="text"
                  value={rejectedReason}
                  onChange={(e) => setRejectedReason(e.target.value)}
                  placeholder="e.g. Ghana Card mismatch or unclear stall location"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReviewAction("REJECT")}
                className="flex items-center gap-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 px-4 rounded-xl transition"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setSelectedSeller(null)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 py-2.5 px-4 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleReviewAction("APPROVE")}
                  className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 px-6 rounded-xl transition shadow-xs"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>Approve & Verify Store</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
