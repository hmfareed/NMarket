"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bike,
  ShieldCheck,
  DollarSign,
  Package,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Navigation,
  Power,
  KeyRound,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface RiderProfile {
  vehicleType: "MOTORCYCLE" | "TRICYCLE" | "BICYCLE";
  licensePlate?: string;
  ghanaCardNumber?: string;
  operatingZone: string;
  isOnline: boolean;
  currentEarnings: number;
  totalCompletedDeliveries: number;
  rating: number;
}

interface DeliveryJob {
  _id: string;
  orderNumber: string;
  sellerOrderId: string;
  pickupLocation: {
    storeName: string;
    area: string;
    address: string;
    phone: string;
  };
  dropoffLocation: {
    recipient: string;
    phone: string;
    area: string;
    address: string;
    landmark?: string;
    deliveryInstructions?: string;
  };
  status: "PENDING_DISPATCH" | "ACCEPTED" | "PICKED_UP" | "DELIVERED";
  deliveryFee: number;
  createdAt: string;
}

export default function RiderPortalPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [activeJob, setActiveJob] = useState<DeliveryJob | null>(null);
  const [availableJobs, setAvailableJobs] = useState<DeliveryJob[]>([]);
  const [riderName, setRiderName] = useState("");

  // OTP Form State
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Setup Form State for first-time riders
  const [showSetup, setShowSetup] = useState(false);
  const [setupVehicle, setSetupVehicle] = useState<"MOTORCYCLE" | "TRICYCLE" | "BICYCLE">("MOTORCYCLE");
  const [setupPlate, setSetupPlate] = useState("");
  const [setupZone, setSetupZone] = useState("Tamale Central (Zone 1)");

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get profile
      const profRes = await fetch("/api/rider/profile");
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData.riderProfile);
        setRiderName(profData.name || "Tamale Rider");
        if (!profData.riderProfile?.licensePlate && profData.riderProfile?.totalCompletedDeliveries === 0) {
          setShowSetup(true);
        }
      }

      // 2. Get jobs
      const jobsRes = await fetch("/api/rider/jobs");
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setAvailableJobs(jobsData.availableJobs || []);
        setActiveJob(jobsData.activeJob || null);
      }
    } catch (err) {
      console.error("Failed to load rider portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleOnlineStatus = async () => {
    if (!profile) return;
    try {
      const res = await fetch("/api/rider/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: !profile.isOnline }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.riderProfile);
      }
    } catch (err) {
      console.error("Toggle online status error:", err);
    }
  };

  const handleSaveSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/rider/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleType: setupVehicle,
          licensePlate: setupPlate,
          operatingZone: setupZone,
          isOnline: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.riderProfile);
        setShowSetup(false);
        fetchData();
      }
    } catch (err) {
      console.error("Setup error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/rider/jobs/${jobId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to claim job.");
        return;
      }
      fetchData();
    } catch (err) {
      console.error("Accept job error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPickup = async (jobId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/rider/jobs/${jobId}/pickup`, {
        method: "POST",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Pickup error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;
    if (otpInput.length !== 4) {
      setOtpError("Please enter the 4-digit code given by the customer.");
      return;
    }

    setOtpError(null);
    setActionLoading(true);

    try {
      const res = await fetch(`/api/rider/jobs/${activeJob._id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Invalid OTP code.");
        return;
      }

      setSuccessMessage(data.message || "Delivery verified! Payout credited.");
      setOtpInput("");
      setTimeout(() => {
        setSuccessMessage(null);
        fetchData();
      }, 2500);
    } catch (err) {
      setOtpError("Network error verifying OTP.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span>Loading Rider Dispatch Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight">
                NMarket <span className="text-emerald-600 font-medium text-sm">Rider</span>
              </span>
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-xs font-bold text-slate-700">Tamale Fleet</span>
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <button
                onClick={toggleOnlineStatus}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  profile.isOnline
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-slate-100 text-slate-600 border border-slate-300"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>{profile.isOnline ? "Online (Accepting Jobs)" : "Offline"}</span>
              </button>
            )}

            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-900 font-bold hidden sm:inline"
            >
              Customer Market →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Onboarding / Setup Card (If not filled) */}
        {showSetup && (
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 space-y-4 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                <Bike className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Welcome to NMarket Rider Fleet!
                </h2>
                <p className="text-xs text-slate-600">
                  Complete your rider setup to start accepting local delivery dispatches across Tamale.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSetup} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={setupVehicle}
                  onChange={(e) => setSetupVehicle(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="MOTORCYCLE">Motorcycle (Haojue / Boxer / Royal)</option>
                  <option value="TRICYCLE">Tricycle / Mahama Can Do (Keke)</option>
                  <option value="BICYCLE">Bicycle</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Number Plate / Registration
                </label>
                <input
                  type="text"
                  required
                  value={setupPlate}
                  onChange={(e) => setSetupPlate(e.target.value)}
                  placeholder="e.g. M-22-NR-4921"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Operating Zone
                </label>
                <select
                  value={setupZone}
                  onChange={(e) => setSetupZone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="Tamale Central (Zone 1)">Tamale Central (Zone 1)</option>
                  <option value="Tamale Outer (Zone 2)">Tamale Outer & Sagnarigu (Zone 2)</option>
                </select>
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition shadow-xs"
                >
                  {actionLoading ? "Saving..." : "Activate Rider Status & Go Online"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Today's Earnings
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-700">
              {formatGHS(profile?.currentEarnings || 0)}
            </p>
            <span className="text-[10px] text-slate-400">Instant MoMo Payout</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Completed Trips
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {profile?.totalCompletedDeliveries || 0}
            </p>
            <span className="text-[10px] text-slate-400">Tamale Deliveries</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rider Rating
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-600">
              ⭐ {profile?.rating ? profile.rating.toFixed(1) : "5.0"}
            </p>
            <span className="text-[10px] text-slate-400">Verified by Buyers</span>
          </div>
        </div>

        {/* ACTIVE DELIVERY CARD */}
        {activeJob ? (
          <div className="bg-white rounded-3xl border-2 border-emerald-500 p-6 space-y-5 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-emerald-600 animate-pulse" />
                <h3 className="font-black text-slate-900 text-base">
                  Active Delivery in Progress
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                Payout: {formatGHS(activeJob.deliveryFee)}
              </span>
            </div>

            {/* Step 1: Pickup Location */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Step 1: Pick up from Merchant Stall
                </span>
                {activeJob.status === "PICKED_UP" ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Package Picked Up</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleConfirmPickup(activeJob._id)}
                    disabled={actionLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Confirm Store Pickup
                  </button>
                )}
              </div>
              <p className="font-black text-slate-900 text-sm">{activeJob.pickupLocation.storeName}</p>
              <p className="text-slate-600">
                {activeJob.pickupLocation.address}, {activeJob.pickupLocation.area}
              </p>
              <a
                href={`tel:${activeJob.pickupLocation.phone}`}
                className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline mt-1"
              >
                <Phone className="h-3 w-3" />
                <span>Call Merchant ({activeJob.pickupLocation.phone})</span>
              </a>
            </div>

            {/* Step 2: Dropoff Location */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                Step 2: Deliver to Customer Destination
              </span>
              <p className="font-black text-slate-900 text-sm">{activeJob.dropoffLocation.recipient}</p>
              <p className="text-slate-600">
                {activeJob.dropoffLocation.area}, Tamale ({activeJob.dropoffLocation.address})
              </p>
              {activeJob.dropoffLocation.landmark && (
                <p className="text-slate-500">
                  Landmark: <strong>{activeJob.dropoffLocation.landmark}</strong>
                </p>
              )}
              {activeJob.dropoffLocation.deliveryInstructions && (
                <p className="text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Note: "{activeJob.dropoffLocation.deliveryInstructions}"
                </p>
              )}
              <a
                href={`tel:${activeJob.dropoffLocation.phone}`}
                className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline mt-1"
              >
                <Phone className="h-3 w-3" />
                <span>Call Customer ({activeJob.dropoffLocation.phone})</span>
              </a>
            </div>

            {/* Step 3: OTP Verification Form */}
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-300 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <KeyRound className="h-4 w-4 text-emerald-600" />
                <span>Step 3: Ask Customer for 4-Digit Delivery OTP</span>
              </div>
              <p className="text-[11px] text-slate-600">
                The buyer received a 4-digit code upon placing the order. Enter it below to release the package and trigger instant payout:
              </p>

              {otpError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleCompleteWithOtp} className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 8883"
                  className="w-32 py-2.5 px-3 text-center font-mono font-black text-xl tracking-widest bg-white border-2 border-emerald-400 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={actionLoading || otpInput.length !== 4}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verify & Complete Delivery</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Available Jobs List in Tamale */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Available Delivery Jobs in Tamale
                </h3>
                <p className="text-xs text-slate-500">
                  Packages ready for pickup at local stalls
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {availableJobs.length} {availableJobs.length === 1 ? "Job" : "Jobs"} Available
              </span>
            </div>

            {availableJobs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Package className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-800">No pending dispatches right now</p>
                <p className="text-xs text-slate-500">
                  Stay online! When Tamale merchants mark orders ready, new jobs will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-500 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {job.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({job.sellerOrderId})
                        </span>
                      </div>
                      <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        +{formatGHS(job.deliveryFee)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Package className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Pick up:</span>
                          <span className="font-bold text-slate-900">{job.pickupLocation.storeName}</span>
                          <p className="text-slate-500 text-[11px]">{job.pickupLocation.area}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Drop off:</span>
                          <span className="font-bold text-slate-900">{job.dropoffLocation.recipient}</span>
                          <p className="text-slate-500 text-[11px]">{job.dropoffLocation.area}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => handleAcceptJob(job._id)}
                        disabled={actionLoading || !profile?.isOnline}
                        className="bg-slate-900 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs py-2 px-4 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Bike className="h-3.5 w-3.5" />
                        <span>Accept Delivery Job</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
