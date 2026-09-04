"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Send,
  AlertCircle,
  Store,
  Bike,
  Filter,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface PayoutRecord {
  _id: string;
  recipientType: "SELLER" | "RIDER";
  recipientName: string;
  momoNetwork: string;
  momoNumber: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  reference: string;
  relatedOrderNumbers: string[];
  disbursedAt?: string;
  createdAt: string;
}

interface PayoutSummary {
  totalPending: number;
  totalDisbursed: number;
  countPending: number;
  countDisbursed: number;
}

export default function AdminPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [summary, setSummary] = useState<PayoutSummary>({
    totalPending: 0,
    totalDisbursed: 0,
    countPending: 0,
    countDisbursed: 0,
  });
  const [filter, setFilter] = useState("ALL");
  const [auditLoading, setAuditLoading] = useState(false);
  const [disburseLoading, setDisburseLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payouts?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
        setSummary(
          data.summary || {
            totalPending: 0,
            totalDisbursed: 0,
            countPending: 0,
            countDisbursed: 0,
          }
        );
      }
    } catch (err) {
      console.error("Failed to load payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [filter]);

  const handleGenerateAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/admin/payouts", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message || "Audit completed!");
        fetchPayouts();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleDisburse = async (id: string) => {
    setDisburseLoading(id);
    try {
      const res = await fetch(`/api/admin/payouts/${id}/disburse`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message || "Disbursement confirmed!");
        fetchPayouts();
        setTimeout(() => setNotification(null), 4000);
      } else {
        alert(data.error || "Failed to disburse.");
      }
    } catch (err) {
      console.error("Disburse error:", err);
    } finally {
      setDisburseLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Escrow Settlements & MoMo Payouts</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
              Financial Clearing
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit completed deliveries and disburse net earnings to Tamale merchants and fleet riders.
          </p>
        </div>

        <button
          onClick={handleGenerateAudit}
          disabled={auditLoading}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${auditLoading ? "animate-spin" : ""}`} />
          <span>Audit & Discover Settlements</span>
        </button>
      </div>

        {notification && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Escrow Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending in Escrow
              </span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-700">
              {formatGHS(summary.totalPending)}
            </p>
            <p className="text-xs text-slate-400">
              {summary.countPending} payouts ready for disbursement
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Disbursed
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">
              {formatGHS(summary.totalDisbursed)}
            </p>
            <p className="text-xs text-slate-400">
              {summary.countDisbursed} payments settled to MoMo
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 w-fit text-xs font-bold shadow-xs">
          <Filter className="h-3 w-3 text-slate-400 ml-2" />
          {[
            { id: "ALL", label: `All Settlements (${payouts.length})` },
            { id: "PENDING", label: `Pending (${summary.countPending})` },
            { id: "PAID", label: `Disbursed (${summary.countDisbursed})` },
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

        {/* Payouts Table / Cards */}
        {loading ? (
          <div className="py-24 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span>Loading settlement records...</span>
          </div>
        ) : payouts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <CreditCard className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No payouts in this view</p>
            <p className="text-xs text-slate-500">
              Click "Audit & Discover Settlements" to scan for newly completed orders.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {payouts.map((p) => (
                <div
                  key={p._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  {/* Recipient Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          p.recipientType === "SELLER"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {p.recipientType === "SELLER" ? (
                          <Store className="h-3 w-3" />
                        ) : (
                          <Bike className="h-3 w-3" />
                        )}
                        <span>{p.recipientType}</span>
                      </span>

                      <span className="font-bold text-sm text-slate-900">
                        {p.recipientName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{p.momoNetwork}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-600">{p.momoNumber}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400">{p.reference}</span>
                    </div>
                  </div>

                  {/* Amount & Status Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-black text-lg text-slate-900 block">
                        {formatGHS(p.amount)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          p.status === "PAID"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {p.status === "PAID" ? "Disbursed" : "Pending Payout"}
                      </span>
                    </div>

                    {p.status === "PENDING" ? (
                      <button
                        onClick={() => handleDisburse(p._id)}
                        disabled={disburseLoading === p._id}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition"
                      >
                        {disburseLoading === p._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>Disburse MoMo</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Paid to MoMo</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
