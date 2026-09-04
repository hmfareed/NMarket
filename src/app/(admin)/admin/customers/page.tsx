"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  Calendar,
  Eye,
  X,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface CustomerItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  landmark?: string;
  totalOrders: number;
  totalSpent: number;
  status: string;
  isPhoneVerified?: boolean;
  joinedAt: string;
  lastOrderAt?: string;
}

export default function AdminCustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "REPEAT" | "HIGH_VALUE">("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch("/api/admin/customers");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
        }
      } catch (err) {
        console.error("Failed to load admin customers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        search.trim() === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.area.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterTab === "REPEAT") return c.totalOrders >= 5;
      if (filterTab === "HIGH_VALUE") return c.totalSpent >= 2000;
      return true;
    });
  }, [customers, search, filterTab]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-bold text-slate-500">Loading Tamale Customers Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customers Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Users className="h-3 w-3" />
              <span>8,492 Registered</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamale metropolis registered accounts, purchase histories, and dropoff destinations
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-dark-900 text-blue-400 text-xs font-bold hover:bg-dark-800 transition shadow-xs self-start sm:self-auto"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Fulfill Customer Orders</span>
        </Link>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Total Customers</span>
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-200">
              +21.1%
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">8,492</p>
          <p className="text-[10px] text-slate-400">Registered across Northern Ghana</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Active This Month</span>
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-200">
              Active
            </span>
          </div>
          <p className="text-2xl font-black text-blue-600 tracking-tight">1,280</p>
          <p className="text-[10px] text-slate-400">Ordered in the last 30 days</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Avg Customer Spend</span>
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-200">
              Lifetime
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">GH₵ 215.00</p>
          <p className="text-[10px] text-slate-400">Per customer average turnover</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Phone Verified</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-200">
              High Trust
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">98.4%</p>
          <p className="text-[10px] text-slate-400">MoMo SMS OTP confirmed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or Tamale area..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === "ALL"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Customers ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("REPEAT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === "REPEAT"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Repeat Buyers (5+ Orders)
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("HIGH_VALUE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === "HIGH_VALUE"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              High Value (GH₵ 2k+)
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">Customer</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Primary Area</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-blue-50/30 transition group cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    {/* Customer */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-xs shrink-0">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {customer.name}
                          </p>
                          <p className="text-[10px] text-slate-400">ID: #{customer._id.slice(0, 7)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-mono font-bold text-slate-800 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{customer.phone}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {customer.email}
                        </p>
                      </div>
                    </td>

                    {/* Primary Area */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <MapPin className="h-3 w-3 text-blue-600 shrink-0" />
                        <span className="font-bold">{customer.area}</span>
                      </div>
                    </td>

                    {/* Orders Placed */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
                        <ShoppingBag className="h-3 w-3 text-slate-500" />
                        <span>{customer.totalOrders} orders</span>
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-slate-900">
                        {formatGHS(customer.totalSpent)}
                      </span>
                    </td>

                    {/* Verification */}
                    <td className="py-3.5 px-4">
                      {customer.isPhoneVerified !== false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Unverified</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer group-hover:bg-blue-600 group-hover:text-white"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Slide-over Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />

          <div className="relative w-screen max-w-md bg-white shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">{selectedCustomer.name}</h2>
                  <p className="text-[10px] text-slate-400">Customer #{selectedCustomer._id.slice(0, 8)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs flex-1">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80">
                  <span className="text-[10px] font-bold text-blue-700">Total Spent</span>
                  <p className="font-mono font-black text-base text-blue-950 mt-0.5">
                    {formatGHS(selectedCustomer.totalSpent)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500">Orders Placed</span>
                  <p className="font-black text-base text-slate-900 mt-0.5">
                    {selectedCustomer.totalOrders}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Contact Information
                </p>
                <div className="space-y-1.5 pt-1 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone Number:</span>
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="font-mono font-bold text-blue-600 hover:underline"
                    >
                      {selectedCustomer.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-bold text-slate-800">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Tamale Destination */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Primary Delivery Destination
                </p>
                <div className="space-y-1 pt-1 text-slate-700">
                  <p className="font-bold flex items-center gap-1.5 text-slate-900">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    <span>{selectedCustomer.area}, Tamale Metropolis</span>
                  </p>
                  {selectedCustomer.landmark && (
                    <p className="text-[11px] text-slate-500 pl-5">
                      Landmark: {selectedCustomer.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Account History */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Account Timeline
                </p>
                <div className="space-y-1 text-[11px] text-slate-500">
                  <p>
                    Joined Marketplace:{" "}
                    <strong className="text-slate-700">
                      {new Date(selectedCustomer.joinedAt).toLocaleDateString()}
                    </strong>
                  </p>
                  {selectedCustomer.lastOrderAt && (
                    <p>
                      Most Recent Purchase:{" "}
                      <strong className="text-slate-700">
                        {new Date(selectedCustomer.lastOrderAt).toLocaleDateString()}
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between sticky bottom-0">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Close Profile
              </button>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs shadow-blue-600/20 transition cursor-pointer"
              >
                <span>View Orders</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
