"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Crosshair,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { TAMALE_AREAS } from "@/lib/constants/tamale-areas";
import { calculateTamaleDeliveryFee } from "@/lib/delivery-fee";
import { formatGHS } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { openLocationPrompt, currentLocation } = useLocation();

  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("Lamashegu");
  const [pickupAddress, setPickupAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [momoNetwork, setMomoNetwork] = useState("MTN_MOMO");
  const [momoPhone, setMomoPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Saved Addresses State
  interface SavedAddress {
    _id: string;
    label: string;
    recipient: string;
    phone: string;
    area: string;
    pickupAddress?: string;
    streetAddress?: string;
    formattedAddress?: string;
    landmark?: string;
    location?: {
      type: "Point";
      coordinates: [number, number];
    };
    isDefault?: boolean;
  }
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveThisAddress, setSaveThisAddress] = useState(false);

  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetch("/api/customer/addresses");
        if (res.ok) {
          const data = await res.json();
          const list: SavedAddress[] = data.addresses || [];
          setSavedAddresses(list);
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            setRecipient(defaultAddr.recipient);
            setPhone(defaultAddr.phone);
            setArea(defaultAddr.area);
            setPickupAddress(defaultAddr.streetAddress || defaultAddr.pickupAddress || defaultAddr.formattedAddress || "");
            if (defaultAddr.landmark) setLandmark(defaultAddr.landmark);
          } else if (currentLocation) {
            if (currentLocation.area) setArea(currentLocation.area);
            if (currentLocation.streetAddress || currentLocation.formattedAddress) {
              setPickupAddress(currentLocation.streetAddress || currentLocation.formattedAddress || "");
            }
          }
        }
      } catch {}
    }
    loadAddresses();
  }, [currentLocation]);

  // Group items by seller
  const uniqueStoreCount = new Set(items.map((i) => i.storeId || "default")).size;

  const deliveryCalc = calculateTamaleDeliveryFee({
    destinationArea: area,
    uniqueSellerCount: uniqueStoreCount,
  });

  const totalAmount = subtotal + deliveryCalc.totalDeliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!recipient || !phone || !pickupAddress) {
      setError("Please complete all required recipient and address fields.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          shippingAddress: {
            recipient,
            phone,
            area,
            pickupAddress,
            streetAddress: pickupAddress,
            landmark,
            deliveryInstructions,
            location: currentLocation?.coordinates
              ? {
                  type: "Point",
                  coordinates: currentLocation.coordinates,
                }
              : undefined,
          },
          paymentMethod: "MOBILE_MONEY",
          momoNetwork,
          momoPhone: momoPhone || phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      // Initialize Paystack / Mobile Money Gateway Transaction
      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.orderId,
          momoPhone: momoPhone || phone,
          momoNetwork,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error || "Failed to initialize payment gateway.");
      }

      if (saveThisAddress) {
        fetch("/api/customer/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: "Home",
            recipient,
            phone,
            area,
            streetAddress: pickupAddress,
            pickupAddress,
            landmark,
            deliveryInstructions,
            location: currentLocation?.coordinates
              ? {
                  type: "Point",
                  coordinates: currentLocation.coordinates,
                }
              : undefined,
            accuracyMeters: currentLocation?.accuracyMeters,
          }),
        }).catch(() => {});
      }

      clearCart();

      if (payData.isSimulated) {
        // Auto-verify simulated pilot payment
        await fetch(`/api/payments/verify/${payData.reference}`);
        router.push(`/orders/${data.orderId}`);
      } else if (payData.authorizationUrl) {
        window.location.href = payData.authorizationUrl;
      } else {
        router.push(`/orders/${data.orderId}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-sm w-full space-y-4 shadow-sm">
          <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">Your cart is empty</h2>
          <p className="text-xs text-slate-500">
            Browse local products from verified merchants in Tamale before checking out.
          </p>
          <Link
            href="/"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition"
          >
            Explore Tamale Market
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900">Checkout & Instant Delivery</h1>
              <p className="text-xs text-slate-500">
                Fulfill orders locally in Tamale with Mobile Money
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            <span>Delivery OTP Protected</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Delivery & MoMo details */}
            <div className="lg:col-span-7 space-y-5">
              {/* Section 1: Tamale Delivery Destination */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Delivery Address in Tamale</span>
                  </div>
                  <button
                    type="button"
                    onClick={openLocationPrompt}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
                  >
                    <Crosshair className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                    <span>{currentLocation?.isGpsVerified ? `GPS Locked (±${currentLocation.accuracyMeters || 4}m)` : "Detect Exact GPS"}</span>
                  </button>
                </div>

                {/* Saved Tamale Address Selector */}
                {savedAddresses.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Saved Dropoff Addresses
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr._id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(addr._id);
                            setRecipient(addr.recipient);
                            setPhone(addr.phone);
                            setArea(addr.area);
                            setPickupAddress(addr.streetAddress || addr.pickupAddress || addr.formattedAddress || "");
                            if (addr.landmark) setLandmark(addr.landmark);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border text-left ${
                            selectedAddressId === addr._id
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="font-extrabold">{addr.label}:</span> {addr.area} ({addr.recipient})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. Amina Alhassan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (For Rider Call) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="024 123 4567"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tamale Community / Area *
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  >
                    {TAMALE_AREAS.map((a) => (
                      <option key={a.slug} value={a.name}>
                        {a.name} — {a.zoneName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    House / Street / Stall Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="e.g. Near Tamale Central Mosque or Hse No. B12 Lamashegu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nearest Landmark
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Total Filling Station, Old Stadium"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Instructions
                    </label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Call when entering junction"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveThisAddress}
                      onChange={(e) => setSaveThisAddress(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="font-medium">Save this address to my account for future Tamale orders</span>
                  </label>
                </div>
              </div>

              {/* Section 2: Mobile Money Payment */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Mobile Money Settlement</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Network
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "MTN_MOMO", label: "MTN MoMo" },
                      { id: "TELECEL_CASH", label: "Telecel Cash" },
                      { id: "AIRTELTIGO_MONEY", label: "AT Money" },
                    ].map((net) => (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setMomoNetwork(net.id)}
                        className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition ${
                          momoNetwork === net.id
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {net.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MoMo Wallet Number
                  </label>
                  <input
                    type="tel"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder={phone || "024 123 4567"}
                    className="w-full px-3 py-2.5 font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    A USSD prompt will be simulated to complete instant pilot payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Placement */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs sticky top-24">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {items.length} {items.length === 1 ? "Item" : "Items"}
                  </span>
                </h2>

                {/* Items List */}
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 space-y-2 pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="pt-2 flex items-center gap-3">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100"}
                        alt={item.name}
                        className="h-10 w-10 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {formatGHS(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-slate-900">{formatGHS(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>
                      Delivery ({deliveryCalc.zoneName.split("(")[0].trim()})
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatGHS(deliveryCalc.baseFee)}
                    </span>
                  </div>

                  {deliveryCalc.multiSellerSurcharge > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Multi-Seller Stop Fee ({uniqueStoreCount} shops)</span>
                      <span className="font-bold text-amber-700">
                        +{formatGHS(deliveryCalc.multiSellerSurcharge)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-emerald-700">{formatGHS(totalAmount)}</span>
                  </div>
                </div>

                {/* Delivery Guarantee notice */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Estimated delivery time in <strong>{deliveryCalc.estimatedMinutes} mins</strong>. You will receive a <strong>4-digit Delivery OTP</strong> upon placing this order.
                  </p>
                </div>

                {/* Submit Checkout Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs py-3.5 rounded-xl shadow-sm transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Reserving Stock & Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay {formatGHS(totalAmount)} with Mobile Money</span>
                      <Truck className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
