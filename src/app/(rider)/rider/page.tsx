import Link from "next/link";
import { Bike, ShieldCheck, DollarSign, ArrowRight } from "lucide-react";

export default function RiderPortalPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Rider Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">
              NMarket <span className="text-emerald-600 font-medium text-sm">Rider</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            ← Back to Customer Market
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
            <Bike className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Deliver with NMarket in Tamale
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto mt-3">
            Earn per delivery by transporting orders from local shops in Lamashegu
            and Central Market to customers across Tamale. Quick OTP verification
            ensures you get paid without hassle.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mt-8 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-slate-900">Per-Delivery Payouts</h4>
                <p className="text-[11px] text-slate-500">
                  Fixed base fee plus zone surcharges credited directly to your account.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-slate-900">OTP Handover</h4>
                <p className="text-[11px] text-slate-500">
                  Customer confirms delivery with a 4-digit code. Zero delivery disputes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-sm">
              <span>Apply as a Delivery Partner</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
