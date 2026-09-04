"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Loader2,
  Store,
  Phone,
  Filter,
  Check,
  X,
  FileText,
} from "lucide-react";

interface DisputeItem {
  _id: string;
  disputeNumber: string;
  orderNumber: string;
  sellerOrderId?: string;
  storeName: string;
  customerName: string;
  customerPhone: string;
  reason: string;
  description: string;
  status:
    | "OPEN"
    | "UNDER_REVIEW"
    | "RESOLVED_REFUND"
    | "RESOLVED_REPLACEMENT"
    | "RESOLVED_NO_ACTION"
    | "REJECTED";
  adminNotes?: string;
  refundAmount?: number;
  createdAt: string;
}

export default function AdminDisputesPage() {
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [counts, setCounts] = useState({
    all: 0,
    open: 0,
    underReview: 0,
    resolved: 0,
    rejected: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<Record<string, string>>({});

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/disputes?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
        setCounts(data.counts || { all: 0, open: 0, underReview: 0, resolved: 0, rejected: 0 });
      }
    } catch (err) {
      console.error("Failed to load disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const handleResolve = async (id: string, nextStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/disputes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          adminNotes: adminNoteInput[id] || "Reviewed and resolved by operations admin.",
        }),
      });

      if (res.ok) {
        fetchDisputes();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update dispute.");
      }
    } catch (err) {
      console.error("Resolve error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Disputes & Resolution Center</span>
            <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
              Buyer Protection
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Investigate buyer complaints, wrong item claims, and adjudicate refunds in Tamale.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
          <Filter className="h-3 w-3 text-slate-400 ml-2" />
            {[
              { id: "ALL", label: `All (${counts.all})` },
              { id: "OPEN", label: `Open (${counts.open})` },
              { id: "UNDER_REVIEW", label: `In Review (${counts.underReview})` },
              { id: "RESOLVED_REFUND", label: `Refunded` },
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

        {/* Disputes Queue */}
        {loading ? (
          <div className="py-24 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span>Loading disputes...</span>
          </div>
        ) : disputes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <CheckCircle2 className="h-10 w-10 text-blue-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No disputes in this view</p>
            <p className="text-xs text-slate-500">
              Zero pending complaints or delivery issues reported by Tamale shoppers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">
                      {d.disputeNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      (Order: {d.orderNumber})
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      d.status === "OPEN"
                        ? "bg-amber-100 text-amber-800"
                        : d.status === "UNDER_REVIEW"
                        ? "bg-blue-100 text-blue-800"
                        : d.status === "RESOLVED_REFUND"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>{d.status.replace(/_/g, " ")}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {/* Complaint Details */}
                  <div className="md:col-span-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                        Issue: {d.reason.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Filed {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed italic">
                      "{d.description}"
                    </div>

                    {d.adminNotes && (
                      <p className="text-[11px] text-blue-800 bg-blue-50 p-2 rounded-lg border border-blue-200">
                        <strong>Admin Note:</strong> {d.adminNotes}
                      </p>
                    )}
                  </div>

                  {/* Merchant & Customer Info */}
                  <div className="md:col-span-4 bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Merchant
                      </span>
                      <p className="font-bold text-slate-900 flex items-center gap-1">
                        <Store className="h-3 w-3 text-blue-600" />
                        <span>{d.storeName}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Buyer
                      </span>
                      <p className="font-bold text-slate-900">{d.customerName}</p>
                      <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{d.customerPhone}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resolution Actions Bar */}
                {["OPEN", "UNDER_REVIEW"].includes(d.status) && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Add investigation notes or rationale..."
                      value={adminNoteInput[d._id] || ""}
                      onChange={(e) =>
                        setAdminNoteInput((prev) => ({ ...prev, [d._id]: e.target.value }))
                      }
                      className="w-full sm:w-80 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      {d.status === "OPEN" && (
                        <button
                          onClick={() => handleResolve(d._id, "UNDER_REVIEW")}
                          disabled={actionLoading === d._id}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 transition"
                        >
                          Mark In Review
                        </button>
                      )}

                      <button
                        onClick={() => handleResolve(d._id, "RESOLVED_REFUND")}
                        disabled={actionLoading === d._id}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-600/20 transition flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve Refund</span>
                      </button>

                      <button
                        onClick={() => handleResolve(d._id, "REJECTED")}
                        disabled={actionLoading === d._id}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
