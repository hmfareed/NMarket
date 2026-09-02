import Link from "next/link";
import {
  MapPin,
  Search,
  Zap,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Store as StoreIcon,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function CustomerHome() {
  const categories = [
    { name: "Phones & Tablets", icon: "📱", count: "120+ items" },
    { name: "Electronics & Tech", icon: "💻", count: "85+ items" },
    { name: "Fashion & Fabric", icon: "👗", count: "310+ items" },
    { name: "Home & Kitchen", icon: "🍳", count: "90+ items" },
    { name: "Beauty & Personal", icon: "✨", count: "140+ items" },
    { name: "Groceries & Market", icon: "🌾", count: "210+ items" },
  ];

  const featuredStores = [
    {
      name: "Tamale Tech Mart",
      area: "Lamashegu",
      rating: "4.9",
      deliveryTime: "1–2 hrs",
      badge: "Fast Fulfillment",
      category: "Phones & Electronics",
    },
    {
      name: "Northern Threads & Textiles",
      area: "Central Market",
      rating: "4.8",
      deliveryTime: "2–3 hrs",
      badge: "Verified Merchant",
      category: "Local Fashion",
    },
    {
      name: "Savannah Provisions",
      area: "Jisonayili",
      rating: "5.0",
      deliveryTime: "45 mins",
      badge: "Express Local",
      category: "Groceries & Household",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Location & Navigation Top Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  N
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    N<span className="text-emerald-600">Market</span>
                  </span>
                  <span className="hidden sm:inline-block ml-1 text-xs font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Tamale Local
                  </span>
                </div>
              </Link>
            </div>

            {/* Location Selector Bar */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 transition rounded-full cursor-pointer text-sm text-slate-700">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-medium">Deliver to:</span>
              <span className="font-semibold text-slate-900">
                Lamashegu, Tamale
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                Zone 1
              </span>
            </div>

            {/* Portal Switcher & Actions */}
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/seller"
                className="hidden sm:flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <StoreIcon className="h-4 w-4" />
                <span>Sell on NMarket</span>
              </Link>
              <Link
                href="/rider"
                className="hidden lg:flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <Truck className="h-4 w-4" />
                <span>Riders</span>
              </Link>
              <Link
                href="/admin"
                className="text-xs text-slate-500 hover:text-slate-900 font-mono px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
              >
                Admin
              </Link>
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                <span className="bg-emerald-800 text-xs px-1.5 py-0.2 rounded-full">0</span>
              </button>
            </div>
          </div>

          {/* Search bar row */}
          <div className="py-3 border-t border-slate-100 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, phones, groceries from verified sellers in Tamale..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5">
              <span>Find Nearby</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-emerald-50/70 to-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold">
                <Zap className="h-3.5 w-3.5 text-emerald-600" />
                <span>Fast Local Delivery Across Tamale — Under 2–4 Hours</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Shop from trusted local stores in{" "}
                <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy">
                  Tamale
                </span>
                , delivered to your door today.
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-xl">
                No more waiting 4–7 days for packages from Accra. NMarket connects
                you directly to nearby merchants in Lamashegu, Jisonayili, Vittin,
                and Sakasaka with instant Mobile Money checkout.
              </p>

              {/* Value proposition badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">1–3 Hour Delivery</p>
                    <p className="text-slate-500">Tamale Central Zone</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">Verified Sellers</p>
                    <p className="text-slate-500">Vetted & Monitored</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">OTP Delivery Guard</p>
                    <p className="text-slate-500">Pay on confirmation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Promo Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                  Pilot Launch Offer
                </span>
                <h3 className="text-2xl font-bold mt-4 leading-snug">
                  ₵10 Off Delivery for Your First 3 Orders in Tamale!
                </h3>
                <p className="text-emerald-100 text-sm mt-2">
                  Use coupon code{" "}
                  <span className="font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded">
                    TAMALEFAST
                  </span>{" "}
                  at checkout.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100">
                <span>📍 Covering Lamashegu, Vittin, Sakasaka, & Central</span>
                <span className="font-bold text-white">⚡ Mobile Money Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Browse by Category
            </h2>
            <p className="text-xs text-slate-500">
              Products available for immediate pickup and local delivery
            </p>
          </div>
          <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex flex-col items-center text-center group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition">
                {cat.icon}
              </span>
              <p className="font-semibold text-xs text-slate-900">{cat.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Verified Stores */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full bg-slate-50/50 rounded-3xl border border-slate-200/60 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Verified Tamale Stores
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Nearby
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Order directly from licensed and verified merchants near your community
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredStores.map((store, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {store.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{store.area}, Tamale</span>
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
                    ★ {store.rating}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {store.category}
                  </span>
                  <span className="text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <Zap className="h-3 w-3 text-emerald-600" />
                    <span>{store.deliveryTime}</span>
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {store.badge}
                </span>
                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                  Visit Store →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-sm py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              N
            </div>
            <span className="text-slate-200 font-bold">NMarket</span>
            <span className="text-xs text-slate-500">
              — Northern Ghana's Local Marketplace
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/seller" className="hover:text-white transition">
              Seller Portal
            </Link>
            <Link href="/rider" className="hover:text-white transition">
              Rider Portal
            </Link>
            <Link href="/admin" className="hover:text-white transition">
              Admin Portal
            </Link>
            <Link href="/api/health" className="hover:text-emerald-400 font-mono transition">
              API Health
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
