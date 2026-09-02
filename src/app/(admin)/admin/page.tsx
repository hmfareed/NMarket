import Link from "next/link";
import { Users, Store, Package, AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const kpis = [
    { label: "Gross Marketplace Value (GMV)", value: "₵12,450", change: "+14% this week" },
    { label: "Active Verified Stores", value: "24", change: "Tamale Pilot" },
    { label: "Avg Delivery Time", value: "1h 48m", change: "Within 2h target" },
    { label: "Pending Seller Verifications", value: "3", change: "Action required" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg">
              N
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">
                NMarket Admin Portal
              </span>
              <span className="ml-2 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Super Admin
              </span>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition font-medium"
          >
            ← View Live Market
          </Link>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Platform Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamale Pilot Region — Real-time metrics & moderation queue
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
            >
              <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{kpi.value}</p>
              <p className="text-xs font-medium text-emerald-600 mt-1">{kpi.change}</p>
            </div>
          ))}
        </div>

        {/* Management Queues */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Store className="h-4 w-4 text-emerald-600" />
              <span>Seller Verification Queue</span>
            </div>
            <p className="text-xs text-slate-500">
              3 new merchants in Tamale submitted Ghana Card & store pickup details.
            </p>
            <button className="w-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl transition">
              Review Sellers (3)
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Package className="h-4 w-4 text-emerald-600" />
              <span>Product Moderation</span>
            </div>
            <p className="text-xs text-slate-500">
              12 draft items awaiting catalog approval from approved stores.
            </p>
            <button className="w-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl transition">
              Moderate Products (12)
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>Disputes & Refunds</span>
            </div>
            <p className="text-xs text-slate-500">
              0 open delivery or wrong-item disputes in Tamale Central.
            </p>
            <button className="w-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl transition">
              View Disputes (0)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
