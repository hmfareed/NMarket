"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity as ActivityIcon,
  Search,
  Filter,
  RefreshCw,
  Truck,
  CheckCircle2,
  AlertCircle,
  Store,
  Phone,
  ShoppingCart,
  DollarSign,
  ShieldCheck,
  Clock,
  ArrowRight,
  Loader2,
  Calendar,
} from "lucide-react";

interface ActivityItem {
  _id?: string;
  type: string;
  category: "ORDERS" | "STORE" | "CART" | "REFUNDS" | "SYSTEM";
  title: string;
  description: string;
  entityId?: string;
  entityType?: string;
  actorName?: string;
  actorRole?: string;
  createdAt: string;
}

export default function AdminActivityPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/activities?limit=50");
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesCategory = categoryFilter === "ALL" || act.category === categoryFilter;
      const matchesSearch =
        search.trim() === "" ||
        act.title.toLowerCase().includes(search.toLowerCase()) ||
        act.description.toLowerCase().includes(search.toLowerCase()) ||
        (act.actorName && act.actorName.toLowerCase().includes(search.toLowerCase())) ||
        (act.entityId && act.entityId.toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activities, categoryFilter, search]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ORDER_DELIVERED":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "ORDER_COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "ORDER_CANCELLED":
        return <AlertCircle className="h-4 w-4 text-rose-600" />;
      case "STORE_NAME_CHANGE":
        return <Store className="h-4 w-4 text-purple-600" />;
      case "PHONE_NUMBER_CHANGE":
        return <Phone className="h-4 w-4 text-indigo-600" />;
      case "CART_ITEM_ADDED":
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case "CART_ITEM_REMOVED":
        return <ShoppingCart className="h-4 w-4 text-slate-500" />;
      case "REFUND_REQUESTED":
        return <DollarSign className="h-4 w-4 text-rose-600" />;
      case "STORE_VERIFIED":
        return <ShieldCheck className="h-4 w-4 text-blue-600" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-slate-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case "ORDER_DELIVERED":
      case "STORE_VERIFIED":
        return "bg-blue-50 border-blue-100";
      case "ORDER_COMPLETED":
        return "bg-emerald-50 border-emerald-100";
      case "ORDER_CANCELLED":
      case "REFUND_REQUESTED":
        return "bg-rose-50 border-rose-100";
      case "STORE_NAME_CHANGE":
        return "bg-purple-50 border-purple-100";
      case "PHONE_NUMBER_CHANGE":
        return "bg-indigo-50 border-indigo-100";
      case "CART_ITEM_ADDED":
        return "bg-sky-50 border-sky-100";
      case "CART_ITEM_REMOVED":
        return "bg-slate-100 border-slate-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${Math.floor(diffHrs / 24)}d ago`;
    } catch {
      return "recently";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Operations Activity & Audit Stream
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit log tracking orders, store modifications, cart events, and refund disputes
          </p>
        </div>

        <button
          type="button"
          onClick={loadActivities}
          className="inline-flex items-center gap-2 px-4 py-2 bg-dark-900 hover:bg-dark-800 text-blue-400 font-bold rounded-2xl text-xs transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Live Feed</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Total Events Today</span>
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-200">
              Live
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">142</p>
          <p className="text-[10px] text-slate-400">Platform actions recorded</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Orders & Dispatches</span>
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-200">
              Active
            </span>
          </div>
          <p className="text-2xl font-black text-blue-600 tracking-tight">68</p>
          <p className="text-[10px] text-slate-400">Orders placed & fulfilled</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Store Updates</span>
            <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-purple-200">
              Audited
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">18</p>
          <p className="text-[10px] text-slate-400">Name & phone contact changes</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Cart & Shopper Actions</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-200">
              Turnover
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">56</p>
          <p className="text-[10px] text-slate-400">Items added & removed</p>
        </div>
      </div>

      {/* Main Stream Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-card space-y-5">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by description, actor, or order ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            {[
              { id: "ALL", label: "All Activity" },
              { id: "ORDERS", label: "Orders & OTP" },
              { id: "STORE", label: "Store Changes" },
              { id: "CART", label: "Cart Actions" },
              { id: "REFUNDS", label: "Refunds" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  categoryFilter === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Stream List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-bold">Synchronizing store events...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No activities found matching your criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((act, idx) => (
              <div
                key={act._id || idx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:bg-blue-50/20 hover:border-blue-200 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 border mt-0.5 ${getActivityBg(
                        act.type
                      )}`}
                    >
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-900">
                          {act.title}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {act.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 font-mono text-[11px] font-bold text-slate-400">
                    {formatRelativeTime(act.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span>
                      Actor: <strong className="text-slate-700">{act.actorName || "System Automation"}</strong>
                    </span>
                    {act.actorRole && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {act.actorRole}
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-slate-400">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
