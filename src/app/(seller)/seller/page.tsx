import Link from "next/link";
import { Store, TrendingUp, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

export default function SellerLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Seller Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">
              NMarket <span className="text-emerald-600 font-medium text-sm">Merchant</span>
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

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <Store className="h-3.5 w-3.5" />
              <span>Grow Your Business in Northern Ghana</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Sell to thousands of customers across Tamale with fast local delivery.
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Reach more customers in Lamashegu, Jisonayili, Vittin, and Sakasaka.
              When an order comes in, pack it, hand it to a local delivery rider,
              and receive automated payouts directly to your Mobile Money wallet.
            </p>
          </div>

          {/* Value points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <TrendingUp className="h-6 w-6 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">More Local Sales</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your products are ranked first for nearby buyers in your community.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Fast MoMo Settlements</h3>
              <p className="text-xs text-slate-500 mt-1">
                Earnings clear upon verified OTP customer delivery.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <ShieldAlert className="h-6 w-6 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Vetted Marketplace</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fair dispute resolution and protection against fake orders.
              </p>
            </div>
          </div>

          {/* Registration Box */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Ready to register your store?
              </p>
              <p className="text-xs text-slate-500">
                Requires Ghana Card / Business details & pickup location.
              </p>
            </div>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-sm">
              <span>Start Seller Application</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
