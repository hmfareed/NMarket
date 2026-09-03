"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface ActiveDeliveryItem {
  id: string;
  orderNumber: string;
  riderName: string;
  riderPhone: string;
  route: string;
  eta: string;
  status: "PICKING_UP" | "IN_TRANSIT" | "DELIVERED";
}

const SAMPLE_DELIVERIES: ActiveDeliveryItem[] = [
  {
    id: "DEL-8401",
    orderNumber: "NM-10492",
    riderName: "Abdul Rahman",
    riderPhone: "0241234567",
    route: "Tamale Central → Sagnarigu",
    eta: "22 min",
    status: "IN_TRANSIT",
  },
  {
    id: "DEL-8402",
    orderNumber: "NM-10491",
    riderName: "Salifu Alhassan",
    riderPhone: "0247654321",
    route: "Central Market → Tolon Rd",
    eta: "35 min",
    status: "PICKING_UP",
  },
  {
    id: "DEL-8403",
    orderNumber: "NM-10490",
    riderName: "Yakubu Issah",
    riderPhone: "0249876543",
    route: "Lamashegu → Vittin Estates",
    eta: "18 min",
    status: "IN_TRANSIT",
  },
  {
    id: "DEL-8404",
    orderNumber: "NM-10488",
    riderName: "Haruna Iddrisu",
    riderPhone: "0241122334",
    route: "Aboabo Market → Sakasaka",
    eta: "12 min",
    status: "IN_TRANSIT",
  },
];

export default function DeliveryCommandCenterPage() {
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDeliveryItem[]>(SAMPLE_DELIVERIES);
  const [search, setSearch] = useState("");

  const filteredDeliveries = activeDeliveries.filter(
    (d) =>
      d.riderName.toLowerCase().includes(search.toLowerCase()) ||
      d.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.route.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Delivery Command Center
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time geospatial dispatch and fleet monitoring across Tamale
        </p>
      </div>

      {/* 4 Top KPI Cards matching UI DESIGN.jpg reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Deliveries */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Active Deliveries</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">42</p>
          <p className="text-[10px] text-slate-400">On the road</p>
        </div>

        {/* Pending Pickups */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Pending Pickups</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 tracking-tight">16</p>
          <p className="text-[10px] text-slate-400">Waiting for merchant handoff</p>
        </div>

        {/* Delivered Today */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Delivered Today</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 tracking-tight">28</p>
          <p className="text-[10px] text-slate-400">Verified via OTP</p>
        </div>

        {/* Cancelled */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Cancelled / Delayed</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 tracking-tight">3</p>
          <p className="text-[10px] text-slate-400">Flagged incidents</p>
        </div>
      </div>

      {/* Split View matching UI DESIGN.jpg reference: Map View + Active Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tamale Map Viewport */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4 flex flex-col justify-between min-h-[420px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Tamale Fleet Map</h2>
              <p className="text-[11px] text-slate-400">Live coordinates & active routes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                Tamale Metropolis
              </span>
            </div>
          </div>

          {/* Interactive Map Canvas Visual */}
          <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px]">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

            {/* Pulsing Tamale Landmark Nodes */}
            <div className="absolute top-1/4 left-1/4 flex flex-col items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-500/30 animate-pulse" />
              <span className="text-[9px] font-black text-amber-300 bg-dark-900/90 px-1.5 py-0.5 rounded shadow-xs">
                Sakasaka
              </span>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-emerald-400 ring-6 ring-emerald-400/30 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-200 bg-dark-900/90 px-2 py-0.5 rounded shadow-xs">
                Tamale Central Hub
              </span>
            </div>

            <div className="absolute bottom-1/4 left-1/3 flex flex-col items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-400 ring-4 ring-blue-400/30 animate-pulse" />
              <span className="text-[9px] font-black text-blue-200 bg-dark-900/90 px-1.5 py-0.5 rounded shadow-xs">
                Lamashegu Market
              </span>
            </div>

            <div className="absolute bottom-1/3 right-1/4 flex flex-col items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400 ring-4 ring-amber-400/30 animate-pulse" />
              <span className="text-[9px] font-black text-amber-200 bg-dark-900/90 px-1.5 py-0.5 rounded shadow-xs">
                Vittin
              </span>
            </div>

            <div className="relative z-10 p-4 bg-dark-950/80 backdrop-blur-md rounded-2xl border border-dark-800 text-center space-y-1">
              <p className="text-xs font-black text-white flex items-center gap-1.5 justify-center">
                <Navigation className="h-4 w-4 text-amber-400" />
                <span>Geospatial Proximity Dispatch Active</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Riders automatically routed via Haversine distance matrix
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Active Deliveries Queue matching UI Reference */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">Active Deliveries</h2>
                <p className="text-[11px] text-slate-400">Real-time rider assignments</p>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {filteredDeliveries.length} in progress
              </span>
            </div>

            {/* Quick search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rider or order #..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none"
              />
            </div>

            {/* Delivery List */}
            <div className="divide-y divide-slate-100 space-y-1">
              {filteredDeliveries.map((delivery) => (
                <div key={delivery.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">
                      {delivery.riderName[0]}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{delivery.riderName}</span>
                        <span className="font-mono text-[10px] text-slate-400">#{delivery.orderNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {delivery.route}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                      {delivery.eta}
                    </span>
                    <a
                      href={`tel:${delivery.riderPhone}`}
                      className="block text-[10px] font-bold text-slate-400 hover:text-amber-600"
                    >
                      Call Rider
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="w-full text-center text-xs font-bold text-slate-600 hover:text-amber-600 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            View all dispatch logs →
          </Link>
        </div>
      </div>
    </div>
  );
}
