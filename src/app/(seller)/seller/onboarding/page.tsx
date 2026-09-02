"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  MapPin,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { TAMALE_AREAS } from "@/lib/constants/tamale-areas";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");

  const [area, setArea] = useState("Lamashegu");
  const [pickupAddress, setPickupAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [supportsLocalDelivery, setSupportsLocalDelivery] = useState(true);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(30);

  const [businessType, setBusinessType] = useState<"INDIVIDUAL" | "REGISTERED_BUSINESS">("INDIVIDUAL");
  const [ghanaCardNumber, setGhanaCardNumber] = useState("");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");

  const [payoutProvider, setPayoutProvider] = useState("MTN_MOMO");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [payoutAccountName, setPayoutAccountName] = useState("");

  const selectedAreaObj = TAMALE_AREAS.find((a) => a.name === area);

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!name || !phone) {
        setError("Store Name and Primary Phone number are required.");
        return;
      }
    } else if (step === 2) {
      if (!pickupAddress) {
        setError("Please enter your detailed store or pickup stall address.");
        return;
      }
    } else if (step === 3) {
      const cleanCard = ghanaCardNumber.trim().toUpperCase();
      const cardRegex = /^GHA-[0-9]{9}-[0-9]$/;
      if (!cardRegex.test(cleanCard)) {
        setError("Invalid Ghana Card format. Please use format: GHA-123456789-1");
        return;
      }
    } else if (step === 4) {
      if (!payoutAccountNumber || !payoutAccountName) {
        setError("Mobile Money account number and verified account name are required.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/seller/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          phone,
          whatsappPhone,
          area,
          pickupAddress,
          landmark,
          supportsLocalDelivery,
          prepTimeMinutes,
          businessType,
          ghanaCardNumber: ghanaCardNumber.trim().toUpperCase(),
          businessRegistrationNumber,
          payoutProvider,
          payoutAccountNumber,
          payoutAccountName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit store application.");
      }

      router.push("/seller");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Top Header */}
        <div className="text-center mb-8">
          <Link href="/seller" className="inline-flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
              N
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              N<span className="text-emerald-600">Market</span> Merchant
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Seller Store Registration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete the 4 steps to set up your store and start selling in Tamale
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          {[
            { num: 1, label: "Identity", icon: Store },
            { num: 2, label: "Location", icon: MapPin },
            { num: 3, label: "Verification", icon: ShieldCheck },
            { num: 4, label: "Payout", icon: CreditCard },
            { num: 5, label: "Review", icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isPassed = step > s.num;
            return (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isPassed
                      ? "bg-emerald-600 text-white"
                      : isActive
                      ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isPassed ? "✓" : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 hidden sm:block ${
                    isActive ? "text-emerald-700" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: STORE IDENTITY */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-600" />
                <span>Store Identity & Contact Details</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tamale Tech Mart or Savannah Fabrics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / What do you sell?
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell local customers about your products (phones, fashion, groceries, etc.)..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Order Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    placeholder="050 987 6543"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TAMALE PICKUP LOCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Store Pickup Location in Tamale</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Community / Area in Tamale *
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                >
                  {TAMALE_AREAS.map((a) => (
                    <option key={a.slug} value={a.name}>
                      {a.name} ({a.zoneName})
                    </option>
                  ))}
                </select>
                {selectedAreaObj && (
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Mapped to: <strong>{selectedAreaObj.zoneName}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Physical Address / Shop Number *
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Central Market Line 4, Shop #18 or Near Lamashegu Junction"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prominent Landmark for Delivery Riders
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={
                    selectedAreaObj?.commonLandmarks.length
                      ? `e.g. Near ${selectedAreaObj.commonLandmarks[0]}`
                      : "e.g. Opposite Total filling station"
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Avg Prep Time (Minutes)
                  </label>
                  <select
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value={15}>15 mins (Fast Ready)</option>
                    <option value={30}>30 mins (Standard)</option>
                    <option value={60}>1 hour (Made to order)</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="localDel"
                    checked={supportsLocalDelivery}
                    onChange={(e) => setSupportsLocalDelivery(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="localDel" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Enable Fast Local Tamale Delivery
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: IDENTITY & BUSINESS VERIFICATION */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Merchant Identity & Trust Verification</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Business Entity Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBusinessType("INDIVIDUAL")}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition ${
                      businessType === "INDIVIDUAL"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Individual / Trader
                    <span className="block font-normal text-[10px] text-slate-500 mt-0.5">
                      Sole proprietor or market trader
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBusinessType("REGISTERED_BUSINESS")}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition ${
                      businessType === "REGISTERED_BUSINESS"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Registered Business
                    <span className="block font-normal text-[10px] text-slate-500 mt-0.5">
                      RGD registered enterprise
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghana Card Number * (Required)
                </label>
                <input
                  type="text"
                  required
                  value={ghanaCardNumber}
                  onChange={(e) => setGhanaCardNumber(e.target.value.toUpperCase())}
                  placeholder="GHA-123456789-1"
                  className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold tracking-wide focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Used by our verification team to ensure buyer safety and prevent fraud.
                </p>
              </div>

              {businessType === "REGISTERED_BUSINESS" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registrar General's Registration Number (TIN/BN)
                  </label>
                  <input
                    type="text"
                    value={businessRegistrationNumber}
                    onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                    placeholder="e.g. BN-1234567"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: MOBILE MONEY PAYOUT */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>Mobile Money Settlement Wallet</span>
              </h2>
              <p className="text-xs text-slate-500">
                Where should NMarket send your sales earnings when orders are delivered?
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payout Provider *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "MTN_MOMO", label: "MTN MoMo", badge: "Yellow" },
                    { id: "TELECEL_CASH", label: "Telecel Cash", badge: "Red" },
                    { id: "AIRTELTIGO_MONEY", label: "AT Money", badge: "Blue" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPayoutProvider(p.id)}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition ${
                        payoutProvider === p.id
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Money Wallet Number *
                </label>
                <input
                  type="tel"
                  required
                  value={payoutAccountNumber}
                  onChange={(e) => setPayoutAccountNumber(e.target.value)}
                  placeholder="024 123 4567"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={payoutAccountName}
                  onChange={(e) => setPayoutAccountName(e.target.value)}
                  placeholder="Exact name matching your mobile wallet"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Must match the name on your MoMo SIM and Ghana Card.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SUBMISSION */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Confirm Application Details</span>
              </h2>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Store Name</span>
                  <span className="font-bold text-slate-900">{name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Tamale Location</span>
                  <span className="font-bold text-slate-900">
                    {area} ({pickupAddress})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Ghana Card ID</span>
                  <span className="font-mono font-bold text-slate-900">
                    {ghanaCardNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payout Wallet</span>
                  <span className="font-bold text-slate-900">
                    {payoutProvider} — {payoutAccountNumber} ({payoutAccountName})
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <p className="font-bold">Next step upon submission:</p>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  Our operations team in Tamale will verify your Ghana Card and location details within 2–4 business hours. You will receive an SMS/email notification once your store is activated!
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-xl shadow-xs transition"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 px-8 rounded-xl shadow-sm transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Store Application</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
