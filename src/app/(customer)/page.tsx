"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  ShoppingBag,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Store as StoreIcon,
  Truck,
  Sparkles,
  Loader2,
  Tag,
  X,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  productCount?: number;
}

interface ProductData {
  _id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  images: { url: string; isPrimary: boolean }[];
  inventory: {
    available: number;
  };
  storeId?: {
    _id?: string;
    name: string;
    slug: string;
    address: {
      area: string;
      pickupAddress: string;
    };
    performance?: {
      rating: number;
    };
  };
}

export default function CustomerMarketplace() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity,
    itemCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }

        let url = "/api/products";
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }
        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const prodRes = await fetch(url);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }
      } catch (err) {
        console.error("Failed to load marketplace data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Notification Bar */}
      <div className="bg-emerald-700 text-emerald-50 text-xs py-2 px-4 text-center font-medium tracking-wide">
        🇬🇭 <span className="font-bold">NMarket Pilot Launch:</span> Instant local delivery across Tamale Metropolis (Lamashegu, Central, Vittin, Sakasaka & Sagnarigu)
      </div>

      {/* Main Header / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
                N
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                N<span className="text-emerald-600">Market</span>
              </span>
            </div>

            {/* Tamale Location Selector */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 px-3 py-1.5 rounded-full text-xs cursor-pointer transition">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-slate-500 font-medium">Delivering to:</span>
              <span className="font-bold text-slate-800">
                Lamashegu, Tamale
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                Zone 1
              </span>
            </div>

            {/* Portal Switcher & Actions */}
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/seller"
                className="hidden sm:flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <StoreIcon className="h-4 w-4 text-emerald-600" />
                <span>Sell on NMarket</span>
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <span>Sign In</span>
              </Link>
              <Link
                href="/admin"
                className="text-xs text-slate-500 hover:text-slate-900 font-mono px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
              >
                Admin
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                <span className="bg-emerald-800 text-xs px-1.5 py-0.2 rounded-full font-mono">
                  {itemCount}
                </span>
              </button>
            </div>
          </div>

          {/* Search bar row */}
          <div className="py-3 border-t border-slate-100 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones, Dagbon smocks, raw shea, groceries in Tamale..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
            <button
              onClick={() => {}}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5"
            >
              <span>Search</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-emerald-50/70 to-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold">
                <Zap className="h-3.5 w-3.5 text-emerald-600" />
                <span>Fast Local Delivery Across Tamale — Under 2–4 Hours</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Shop verified stores in{" "}
                <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy">
                  Tamale
                </span>
                , delivered today.
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-xl">
                Skip long delivery delays from Accra. NMarket connects you directly to verified local merchants in Lamashegu, Central Market, Vittin, and Sakasaka with instant Mobile Money checkout.
              </p>

              {/* Value proposition badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">1–3 Hour Delivery</p>
                    <p className="text-[11px] text-slate-500">Tamale Metropolis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">Verified Sellers</p>
                    <p className="text-[11px] text-slate-500">Ghana Card Vetted</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">MoMo Security</p>
                    <p className="text-[11px] text-slate-500">Fast digital checkout</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Promo Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between min-h-[260px]">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 px-2.5 py-1 rounded-full">
                  Pilot Launch Offer
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-4 leading-snug">
                  ₵10 Off Delivery for Your First 3 Orders in Tamale!
                </h3>
                <p className="text-emerald-100 text-xs mt-2">
                  Use coupon code{" "}
                  <span className="font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded">
                    TAMALEFAST
                  </span>{" "}
                  at checkout.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100">
                <span>📍 Lamashegu, Vittin, Sakasaka, Central</span>
                <span className="font-bold text-white">⚡ MTN / Telecel MoMo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Categories Bar */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Explore Categories
            </h2>
            <p className="text-xs text-slate-500">
              Local goods ready for same-day delivery
            </p>
          </div>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              selectedCategory === "all"
                ? "border-emerald-600 bg-emerald-50 shadow-xs"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xs text-slate-800">All Items</span>
            <span className="text-[10px] text-slate-400">Discover</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? "border-emerald-600 bg-emerald-50 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <Tag className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xs text-slate-800 line-clamp-1">{cat.name}</span>
              <span className="text-[10px] text-slate-400">{cat.productCount || 0} items</span>
            </button>
          ))}
        </div>
      </section>

      {/* Live Marketplace Products Grid */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-12 flex-1">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Live in Tamale Marketplace
            </h2>
            <p className="text-xs text-slate-500">
              In-stock items from verified local shops in Northern Region
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {products.length} {products.length === 1 ? "Product" : "Products"} available
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span>Loading marketplace catalog...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No products found</h3>
            <p className="text-xs text-slate-500">
              There are no published products in this category yet. Check back soon or visit other categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-2 text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-xl"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => {
              const imgUrl = p.images?.[0]?.url || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400";
              const storeArea = p.storeId?.address?.area || "Tamale";

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg text-[10px] font-bold text-slate-800 flex items-center gap-1 shadow-xs">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      <span>{storeArea}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold truncate">
                        {p.storeId?.name || "Verified Merchant"}
                      </p>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mt-0.5 leading-snug">
                        {p.name}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-black text-base text-slate-900">
                          {formatGHS(p.price)}
                        </span>
                        {p.compareAtPrice && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            {formatGHS(p.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          addItem({
                            productId: p._id,
                            name: p.name,
                            price: p.price,
                            imageUrl: imgUrl,
                            storeId: p.storeId?._id?.toString(),
                            storeName: p.storeId?.name,
                          })
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              N
            </div>
            <span className="text-slate-200 font-bold text-sm">NMarket</span>
            <span className="text-slate-500">
              — Northern Ghana's Local Fast Marketplace (Tamale)
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/seller" className="hover:text-white transition">
              Seller Portal
            </Link>
            <Link href="/rider" className="hover:text-white transition">
              Rider Portal
            </Link>
            <Link href="/admin" className="hover:text-white transition">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>

      {/* Slide-Over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition"
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Your Cart ({itemCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto divide-y divide-slate-100 space-y-3">
              {cartItems.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700 text-sm">Your cart is empty</p>
                  <p className="text-xs text-slate-400">Add products from local Tamale stores.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.productId} className="pt-3 flex items-center gap-3">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100"}
                      alt={item.name}
                      className="h-14 w-14 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{item.storeName || "Tamale Merchant"}</p>
                      <p className="text-xs font-black text-emerald-700 mt-1">
                        {formatGHS(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded-lg text-slate-500 transition"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold font-mono px-1.5 text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded-lg text-slate-500 transition"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-slate-300 hover:text-red-600 transition"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-black text-base text-slate-900">{formatGHS(subtotal)}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  ⚡ Delivery calculated at checkout (Zone 1: ₵10 / Zone 2: ₵18).
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block text-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs transition"
                >
                  Proceed to Checkout ({itemCount} {itemCount === 1 ? "Item" : "Items"}) →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
