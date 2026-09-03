"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Star,
  Heart,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import CustomerHeader from "@/components/customer/CustomerHeader";

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
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
  rating?: {
    average: number;
    count: number;
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

// Stores Near You curated list for Tamale
const STORES_NEAR_YOU = [
  {
    id: "alhaji-electronics",
    name: "Alhaji Electronics",
    category: "Phones & Electronics",
    distance: "2.4 km",
    area: "Tamale Central",
    rating: 4.9,
    deliveryTime: "25-35 min",
    badge: "⚡ Fast delivery",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&auto=format&fit=crop&q=60",
  },
  {
    id: "savanna-fashion",
    name: "Savanna Fashion",
    category: "Dagbon Smocks & Wear",
    distance: "1.8 km",
    area: "Lamashegu",
    rating: 4.8,
    deliveryTime: "30-40 min",
    badge: "⚡ Fast delivery",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=300&auto=format&fit=crop&q=60",
  },
  {
    id: "shea-craft-hub",
    name: "Northern Shea Hub",
    category: "Organic Cosmetics",
    distance: "3.1 km",
    area: "Sakasaka",
    rating: 5.0,
    deliveryTime: "20-30 min",
    badge: "🌱 Pure Organic",
    image: "https://images.unsplash.com/photo-1608248597359-bb436f564be6?w=300&auto=format&fit=crop&q=60",
  },
];

export default function CustomerMarketplace() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("Tamale Central");
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Elevated Header Component matching UI Reference */}
      <CustomerHeader
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-8 flex-1">
        {/* HERO BANNER matching UI Reference: "SHOP LOCAL. GET IT FASTER." */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-dark-950 via-dark-900 to-amber-950 text-white shadow-elevated p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-amber-500/20">
          <div className="space-y-3 text-center md:text-left z-10 max-w-lg">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-500/30 tracking-wider uppercase">
              ⚡ Tamale Metro Same-Day Delivery
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              SHOP LOCAL.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                GET IT FASTER.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              Discover amazing products from trusted local merchants across Central Market, Lamashegu, Sakasaka, and Vittin.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a
                href="#products"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-black text-xs px-6 py-3 rounded-2xl shadow-md transition transform active:scale-95"
              >
                Shop Now →
              </a>
              <Link
                href="/categories"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3 rounded-2xl backdrop-blur-xs border border-white/15 transition"
              >
                Explore Categories
              </Link>
            </div>
          </div>

          {/* Delivery Rider Graphic */}
          <div className="relative shrink-0 flex items-center justify-center w-52 h-44 sm:w-64 sm:h-52 z-10">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full filter blur-2xl animate-pulse" />
            <div className="relative p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-elevated flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-glow">
                <Truck className="h-8 w-8 text-dark-900" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Tamale Rider Fleet</p>
                <p className="text-[10px] text-amber-300 font-medium">OTP Verified Handshake</p>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORIES SECTION matching UI reference ("Categories / See all") */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Categories
            </h2>
            <Link
              href="/categories"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>See all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Horizontal scrollable categories strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === "all"
                  ? "bg-dark-900 text-amber-400 shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              🔥 All Deals
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                  selectedCategory === cat.name
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "bg-white text-slate-700 hover:bg-amber-50 border border-slate-200/80"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* STORES NEAR YOU SECTION matching UI reference ("Stores Near You / See all") */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Stores Near You
              </h2>
              <p className="text-xs text-slate-500">
                Verified local merchants delivering in {selectedArea}
              </p>
            </div>
            <Link
              href="/seller"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>See all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {STORES_NEAR_YOU.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-card hover:shadow-elevated transition-all flex items-center gap-4 group"
              >
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 truncate">
                      {store.name}
                    </h3>
                    <span className="text-[10px] text-amber-700 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                      ★ {store.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {store.area} • {store.distance}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {store.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* POPULAR PRODUCTS SECTION matching UI reference */}
        <section id="products" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                {selectedCategory === "all" ? "Popular Products in Tamale" : selectedCategory}
              </h2>
              <p className="text-xs text-slate-500">
                {products.length} {products.length === 1 ? "item" : "items"} available for immediate delivery
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="aspect-square w-full bg-slate-100 rounded-2xl" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
                  <div className="h-4 w-1/3 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500">
                Try searching for another local item or clear your active category filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const imgUrl = product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60";
                const isOutOfStock = product.inventory?.available <= 0;
                const originalPrice = product.compareAtPrice || Math.round(product.price * 1.15);
                const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-3xl border border-slate-200/80 hover:border-amber-400 p-3 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Image Area with Click to Detail */}
                    <Link
                      href={`/products/${product._id}`}
                      className="block relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50"
                    >
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                          -{discount}%
                        </span>
                      )}
                      {/* Wishlist Heart Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          // Wishlist toggle
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-xs hover:bg-white text-slate-400 hover:text-rose-500 rounded-full shadow-xs transition"
                      >
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                    </Link>

                    {/* Product Info */}
                    <div className="pt-3 space-y-1">
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {product.storeId?.name || "Tamale Merchant"}
                      </p>
                      <Link
                        href={`/products/${product._id}`}
                        className="block text-xs font-black text-slate-900 group-hover:text-amber-600 transition line-clamp-2 leading-snug"
                      >
                        {product.name}
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="font-bold text-slate-800">
                          {product.rating?.average?.toFixed(1) || "4.8"}
                        </span>
                        <span>({product.rating?.count || 42})</span>
                      </div>

                      {/* Price & Add to Cart Button */}
                      <div className="pt-2 flex items-center justify-between gap-1">
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">
                            {formatGHS(product.price)}
                          </p>
                          <p className="text-[10px] text-slate-400 line-through">
                            {formatGHS(originalPrice)}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() =>
                            addItem({
                              productId: product._id,
                              name: product.name,
                              price: product.price,
                              imageUrl: imgUrl,
                              storeId: product.storeId?._id,
                              storeName: product.storeId?.name,
                            })
                          }
                          className={`p-2.5 rounded-xl transition flex items-center justify-center shadow-xs active:scale-95 ${
                            isOutOfStock
                              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                              : "bg-amber-500 hover:bg-amber-600 text-white"
                          }`}
                          title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        >
                          <Plus className="h-4 w-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Slide-over Cart Drawer matching UI reference ("My Cart") */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900">My Cart</h2>
                  <p className="text-xs text-slate-500">{itemCount} items in basket</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Your basket is empty</p>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs font-bold text-amber-600 hover:underline"
                    >
                      Start Shopping →
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.storeName || "Tamale Merchant"}
                        </p>
                        <p className="text-xs font-black text-slate-900">
                          {formatGHS(item.price)}
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-slate-50 rounded-lg text-slate-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-slate-50 rounded-lg text-slate-500"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Financial Breakdown & Checkout Button */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-800">{formatGHS(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated Tamale Delivery</span>
                      <span className="font-bold text-slate-800">GH₵ 10.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                      <span>Total</span>
                      <span className="text-amber-600">{formatGHS(subtotal + 10)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
