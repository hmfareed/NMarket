"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Percent,
  Truck,
  ShieldCheck,
  Bell,
  Check,
  Loader2,
  Save,
  RefreshCw,
  Coins,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface ZonePricing {
  zone: string;
  fee: number;
  estMinutes: number;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings state
  const [commissionRate, setCommissionRate] = useState<number>(10.0);
  const [zones, setZones] = useState<ZonePricing[]>([
    { zone: "Tamale Central & Commercial Hub", fee: 10.0, estMinutes: 30 },
    { zone: "Lamashegu & Sakasaka", fee: 12.0, estMinutes: 35 },
    { zone: "Nyankpala & UDS Campus", fee: 18.0, estMinutes: 45 },
    { zone: "Savelugu & Outskirts", fee: 25.0, estMinutes: 60 },
  ]);
  const [escrowHours, setEscrowHours] = useState<number>(24);
  const [selfRegistration, setSelfRegistration] = useState<boolean>(true);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setCommissionRate(data.settings.defaultCommissionRate || 10.0);
            if (data.settings.deliveryZones) setZones(data.settings.deliveryZones);
            if (data.settings.escrowHoldingHours) setEscrowHours(data.settings.escrowHoldingHours);
            if (data.settings.sellerSelfRegistration !== undefined) {
              setSelfRegistration(data.settings.sellerSelfRegistration);
            }
            if (data.settings.smsOtpNotifications !== undefined) {
              setSmsNotifications(data.settings.smsOtpNotifications);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultCommissionRate: Number(commissionRate),
          deliveryZones: zones,
          escrowHoldingHours: Number(escrowHours),
          sellerSelfRegistration: selfRegistration,
          smsOtpNotifications: smsNotifications,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleZoneFeeChange = (index: number, newFee: number) => {
    const updated = [...zones];
    updated[index].fee = newFee;
    setZones(updated);
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Marketplace Platform Settings</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
              Rules & Tariffs
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure global marketplace commission, Tamale zone delivery pricing, and escrow policies.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : savedSuccess ? (
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>{savedSuccess ? "Saved Successfully!" : "Save Changes"}</span>
        </button>
      </div>

      {/* 1. Commission Structure */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Default Marketplace Commission</h2>
            <p className="text-xs text-slate-400">
              Standard commission deducted automatically on each successful sale before seller wallet payout.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Default Commission Rate:</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{commissionRate}%</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-72">
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <span className="text-xs font-mono font-bold text-slate-600 w-12 text-right">
              {commissionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Tamale Delivery Zones Pricing */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Tamale Metropolis Delivery Tariffs</h2>
            <p className="text-xs text-slate-400">
              Set standard customer delivery rates across Tamale zones disbursed to dispatch riders.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {zones.map((zone, idx) => (
            <div
              key={zone.zone}
              className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
            >
              <div>
                <p className="font-black text-slate-900">{zone.zone}</p>
                <p className="text-[10px] text-slate-400">Est. transit: {zone.estMinutes} mins</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">GH₵</span>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={zone.fee}
                  onChange={(e) => handleZoneFeeChange(idx, Number(e.target.value))}
                  className="w-20 bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-right text-slate-900"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Escrow & Security Rules */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Escrow & Fraud Guard</h2>
            <p className="text-xs text-slate-400">
              Safeguard buyer payments until delivery OTP confirmation is completed.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Seller Wallet Escrow Hold Duration</p>
              <p className="text-[11px] text-slate-400">
                Number of hours after successful delivery before funds become withdrawable via MoMo.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="72"
                value={escrowHours}
                onChange={(e) => setEscrowHours(Number(e.target.value))}
                className="w-16 bg-white border border-slate-200 rounded-lg p-1.5 font-mono font-bold text-center text-slate-900"
              />
              <span className="text-slate-500 font-bold">Hours</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Merchant Self-Registration</p>
              <p className="text-[11px] text-slate-400">
                Allow new sellers in Northern Ghana to submit stores for admin review.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selfRegistration}
                onChange={(e) => setSelfRegistration(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900">SMS Delivery OTP Handshake Notifications</p>
              <p className="text-[11px] text-slate-400">
                Send instant 6-digit confirmation code via SMS to Tamale customers upon order dispatch.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
