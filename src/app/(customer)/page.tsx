"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  ShoppingBag,
  Zap,
  Truck,
  Sparkles,
  Loader2,
  X,
  Plus,
  Minus,
  Trash2,
  Star,
  Heart,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import CustomerHeader from "@/components/customer/CustomerHeader";
import MegaCategoryNav from "@/components/customer/MegaCategoryNav";

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

// Compact Stores list for quick horizontal swipe
const STORES_NEAR_YOU = [
  {
    id: "alhaji-electronics",
    name: "Alhaji Electronics",
    area: "Tamale Central",
    distance: "2.4 km",
    rating: 4.9,
    badge: "⚡ Fast delivery",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&auto=format&fit=crop&q=60",
  },
  {
    id: "savanna-fashion",
    name: "Savanna Fashion",
    area: "Lamashegu",
    distance: "1.8 km",
    rating: 4.8,
    badge: "⚡ Fast delivery",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=200&auto=format&fit=crop&q=60",
  },
  {
    id: "shea-craft-hub",
    name: "Northern Shea Hub",
    area: "Sakasaka",
    distance: "3.1 km",
    rating: 5.0,
    badge: "🌱 Pure Organic",
    image: "https://images.unsplash.com/photo-1608248597359-bb436f564be6?w=200&auto=format&fit=crop&q=60",
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
      {/* Top Header Navigation */}
      <CustomerHeader
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
      />

      {/* Desktop Big-Screen Mega Category Lineup with Multi-Column Hover Dropdowns */}
      <MegaCategoryNav
        activeCategory={selectedCategory}
        onSelectCategory={(catName) => {
          setSelectedCategory(catName);
          setSearchQuery("");
        }}
        onSelectSubcategory={(subName, catName) => {
          setSelectedCategory(catName);
          setSearchQuery(subName);
        }}
      />

      {/* Main Container - Fills Left and Right Side with edge-to-edge feel */}
      <main className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 space-y-4 flex-1">
        {/* COMPACT HERO PROMO CARD (Matches UI Reference: Sleek, ~110px-130px height, not stretching the mobile screen) */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-dark-950 via-dark-900 to-amber-950 text-white shadow-card p-4 sm:p-6 flex items-center justify-between border border-amber-500/30">
          <div className="space-y-1.5 z-10 max-w-[220px] sm:max-w-md">
            <span className="inline-block text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
              ⚡ Tamale Metro Same-Day
            </span>
            <h1 className="text-base sm:text-2xl font-black tracking-tight leading-tight">
              SHOP LOCAL.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                GET IT FASTER.
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">
              Products from trusted local sellers near you.
            </p>
            <div className="pt-1">
              <a
                href="#product-board"
                className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95"
              >
                <span>Shop Now</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Compact visual badge on right */}
          <div className="relative shrink-0 flex items-center justify-center pr-1 sm:pr-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-glow backdrop-blur-xs">
              <Truck className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400" />
            </div>
          </div>
        </div>

        {/* COMPACT CATEGORIES HORIZONTAL PILLS (Quick 1-tap switching for product board) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              Categories
            </h2>
            <Link
              href="/categories"
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
            >
              <span>See all</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Scrollable category pills filling screen width */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2.5 px-2.5 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === "all"
                  ? "bg-dark-900 text-amber-400 shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90"
              }`}
            >
              🔥 All Deals
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat.name
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                    : "bg-white text-slate-700 hover:bg-amber-50 border border-slate-200/90"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* STORES NEAR YOU (Compact Horizontal Strip matching UI reference) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              Stores Near You
            </h2>
            <Link
              href="/seller"
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
            >
              <span>See all</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-2.5 px-2.5 sm:mx-0 sm:px-0">
            {STORES_NEAR_YOU.map((store) => (
              <div
                key={store.id}
                className="w-56 sm:w-64 bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs flex items-center gap-2.5 shrink-0"
              >
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h3 className="text-xs font-black text-slate-900 truncate">
                    {store.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate">
                    {store.area} • {store.distance}
                  </p>
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                      {store.badge}
                    </span>
                    <span className="text-[9px] font-bold text-amber-700">
                      ★ {store.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DYNAMIC PRODUCT BOARD (Displays products one after the other in continuous discovery grid) */}
        <section id="product-board" className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {selectedCategory === "all" ? "Popular Products in Tamale" : selectedCategory}
              </h2>
              <p className="text-[11px] text-slate-500">
                {products.length} {products.length === 1 ? "item" : "items"} available for immediate delivery
              </p>
            </div>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="text-[11px] font-bold text-amber-600 hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 py-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-3 border border-slate-200 animate-pulse space-y-2">
                  <div className="aspect-square w-full bg-slate-100 rounded-xl" />
                  <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-800">No products found</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            /* 2-Column Responsive Product Discovery Board filling width */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {products.map((product) => {
                const imgUrl =
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60";
                const isOutOfStock = product.inventory?.available <= 0;
                const originalPrice = product.compareAtPrice || Math.round(product.price * 1.15);
                const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 p-2.5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Image Box */}
                    <Link
                      href={`/products/${product._id}`}
                      className="block relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100"
                    >
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Discount Tag */}
                      {discount > 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-md shadow-xs">
                          -{discount}%
                        </span>
                      )}
                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="absolute top-1.5 right-1.5 p-1 bg-white/80 backdrop-blur-xs hover:bg-white text-slate-400 hover:text-rose-500 rounded-full shadow-xs transition"
                      >
                        <Heart className="h-3 w-3" />
                      </button>
                    </Link>

                    {/* Product Details */}
                    <div className="pt-2 space-y-1 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400 font-medium truncate">
                          {product.storeId?.name || "Tamale Merchant"}
                        </p>
                        <Link
                          href={`/products/${product._id}`}
                          className="block text-xs font-bold text-slate-900 group-hover:text-amber-600 transition line-clamp-2 leading-tight mt-0.5"
                        >
                          {product.name}
                        </Link>
                      </div>

                      {/* Rating & Stock */}
                      <div className="pt-1 flex items-center justify-between text-[9px] text-slate-500">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-slate-800">
                            {product.rating?.average?.toFixed(1) || "4.8"}
                          </span>
                        </div>
                        <span className="text-emerald-600 font-semibold">
                          {product.inventory?.available > 0
                            ? `In Stock (${product.inventory.available})`
                            : "Out of stock"}
                        </span>
                      </div>

                      {/* Price Row & Add Button */}
                      <div className="pt-1.5 flex items-center justify-between gap-1 border-t border-slate-100">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-black text-slate-900 font-mono tracking-tight truncate">
                            {formatGHS(product.price)}
                          </p>
                          <p className="text-[9px] text-slate-400 line-through truncate">
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
                          className={`p-2 rounded-xl transition flex items-center justify-center shadow-xs active:scale-90 ${
                            isOutOfStock
                              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                              : "bg-amber-500 hover:bg-amber-600 text-white"
                          }`}
                          title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[3]" />
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

      {/* Slide-out Cart Drawer matching UI Reference ("My Cart") */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900">My Cart</h2>
                  <p className="text-[11px] text-slate-500">{itemCount} items in basket</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <ShoppingBag className="h-10 w-10 text-slate-200 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Your basket is empty</p>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs font-bold text-amber-600 hover:underline"
                    >
                      Browse Tamale deals →
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 truncate">
                          {item.storeName || "Tamale Merchant"}
                        </p>
                        <p className="text-xs font-black text-slate-900 font-mono">
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
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-slate-50 rounded-lg text-slate-500"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Summary & Checkout */}
              {cartItems.length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-800">{formatGHS(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated Tamale Delivery</span>
                      <span className="font-bold text-slate-800">GH₵ 10.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                      <span>Total</span>
                      <span className="text-amber-600">{formatGHS(subtotal + 10)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs py-3 rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
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
