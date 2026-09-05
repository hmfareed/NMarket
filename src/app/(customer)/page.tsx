"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Clock,
  Flame,
  Tag,
  Store as StoreIcon,
  SlidersHorizontal,
  ShieldCheck,
  Phone,
  Check,
  Navigation,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import CustomerHeader from "@/components/customer/CustomerHeader";
import MegaCategoryNav, { MEGA_CATEGORIES } from "@/components/customer/MegaCategoryNav";

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

interface StoreData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone?: string;
  area: string;
  pickupAddress?: string;
  rating: number;
  totalOrders: number;
  productCount: number;
  verificationStatus: string;
  badge: string;
}

type BoardViewMode = "ALL" | "FLASH_DEALS" | "UNDER_100" | "TOP_RATED" | "FAST_DISPATCH";

function CustomerMarketplaceContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const qParam = searchParams.get("q");

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(subcategoryParam || "");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [boardViewMode, setBoardViewMode] = useState<BoardViewMode>("ALL");
  const [searchQuery, setSearchQuery] = useState(qParam || "");
  const { selectedArea, setSelectedArea } = useLocation();
  const [loading, setLoading] = useState(true);

  // Sync category, subcategory and search from query params
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      if (subcategoryParam) {
        setSelectedSubcategory(subcategoryParam);
      }
      setTimeout(() => {
        const el = document.getElementById("product-board");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    if (qParam) {
      setSearchQuery(qParam);
    }
  }, [categoryParam, subcategoryParam, qParam]);

  // Flash deals countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Load products, categories & verified stores from APIs
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch categories
        const catPromise = fetch("/api/categories")
          .then((res) => (res.ok ? res.json() : { categories: [] }))
          .catch(() => ({ categories: [] }));

        // Fetch verified stores
        const storePromise = fetch("/api/stores")
          .then((res) => (res.ok ? res.json() : { stores: [] }))
          .catch(() => ({ stores: [] }));

        // Construct product URL
        let url = "/api/products";
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }
        if (selectedSubcategory.trim()) {
          params.set("q", selectedSubcategory.trim());
        } else if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const prodPromise = fetch(url)
          .then((res) => (res.ok ? res.json() : { products: [] }))
          .catch(() => ({ products: [] }));

        const [catData, storeData, prodData] = await Promise.all([
          catPromise,
          storePromise,
          prodPromise,
        ]);

        setCategories(catData.categories || []);
        setStores(storeData.stores || []);
        setProducts(prodData.products || []);
      } catch (err) {
        console.error("Failed to load marketplace data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  // Subcategories for the currently selected category from MEGA_CATEGORIES definition
  const currentCategoryGroups = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all") return null;
    const found = MEGA_CATEGORIES.find(
      (c) =>
        c.name.toLowerCase() === selectedCategory.toLowerCase() ||
        selectedCategory.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
    );
    return found?.groups || null;
  }, [selectedCategory]);

  // Dynamically transformed product board based on active View Mode & Store Filter
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      // Store filter
      if (selectedStore) {
        const storeMatches =
          p.storeId?.name.toLowerCase().includes(selectedStore.toLowerCase()) ||
          selectedStore.toLowerCase().includes(p.storeId?.name.toLowerCase() || "");
        if (!storeMatches) return false;
      }

      // Board view mode filters
      switch (boardViewMode) {
        case "FLASH_DEALS":
          return (p.compareAtPrice && p.compareAtPrice > p.price) || p.price > 100;
        case "UNDER_100":
          return p.price <= 100;
        case "TOP_RATED":
          return (p.rating?.average || 4.8) >= 4.7;
        case "FAST_DISPATCH":
          return p.inventory.available >= 5;
        default:
          return true;
      }
    });
  }, [products, boardViewMode, selectedStore]);

  // Flash deals sub-shelf (items with compareAtPrice or top discounts)
  const flashDeals = useMemo(() => {
    return products
      .filter((p) => (p.compareAtPrice && p.compareAtPrice > p.price) || p.price > 120)
      .slice(0, 8);
  }, [products]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategory("");
    setSelectedStore("");
    setBoardViewMode("ALL");
    setSearchQuery("");
  };

  // Category & subcategory click handlers with smooth auto-scroll to results
  const handleSelectCategory = (catName: string) => {
    if (catName === "Official Stores") {
      const el = document.getElementById("stores-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setSelectedCategory(catName);
    setSelectedSubcategory("");
    setSelectedStore("");
    setSearchQuery("");
    setTimeout(() => {
      const el = document.getElementById("product-board");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleSelectSubcategory = (subName: string, catName: string) => {
    setSelectedCategory(catName);
    setSelectedSubcategory(subName);
    setSelectedStore("");
    setTimeout(() => {
      const el = document.getElementById("product-board");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Helper to find cart item quantity for a product
  const getCartItemQty = (productId: string) => {
    const found = cartItems.find((i) => i.productId === productId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      {/* Top Header Navigation */}
      <CustomerHeader
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
      />

      {/* Desktop Big-Screen Mega Category Lineup with Cobalt Hover Dropdowns */}
      <MegaCategoryNav
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onSelectSubcategory={handleSelectSubcategory}
      />

      {/* Mobile Horizontal Quick-Category Strip */}
      <div className="md:hidden bg-white border-b border-slate-200/80 px-3 py-2 overflow-x-auto scrollbar-none shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Products
          </button>
          {MEGA_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
          <Link
            href="/categories"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap transition shrink-0"
          >
            <span>All Categories</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Marketplace Canvas */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 flex-1">
        {/* HERO PROMO SHOWCASE */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl border border-blue-500/20 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left Text Content */}
          <div className="space-y-3 z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-[11px] font-black text-blue-300 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tamale Metro Same-Day Delivery · Under 2 Hours</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              SHOP LOCAL TAMALE.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">
                DELIVERED TO YOUR DOORSTEP.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              Fresh provisions, electronics, authentic fabrics & daily essentials directly from verified local merchants across Tamale Central, Sakasaka, Lamashegu & Sagnarigu.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#product-board"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-md transition active:scale-95"
              >
                <span>Explore Deals & Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#stores-section"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-xs transition"
              >
                <StoreIcon className="h-4 w-4 text-blue-400" />
                <span>Verified Stores ({stores.length})</span>
              </a>
            </div>
          </div>

          {/* Right Floating Visual Feature */}
          <div className="relative z-10 shrink-0 flex items-center justify-center self-center md:self-auto">
            <div className="relative p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col items-center text-center space-y-2 min-w-[200px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
                <Truck className="h-7 w-7 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-black text-white">45–90 Mins Delivery</p>
                <p className="text-[10px] text-slate-400">Doorstep OTP Verified</p>
              </div>
              <span className="inline-block text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                MTN MoMo & Telecel Cash
              </span>
            </div>
          </div>
        </div>

        {/* 4 TRUST PILLARS STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 truncate">Fast Dispatch</h4>
              <p className="text-[10px] text-slate-500 truncate">45–90 min local delivery</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 truncate">Verified Stores</h4>
              <p className="text-[10px] text-slate-500 truncate">100% genuine local items</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 truncate">Escrow Safe</h4>
              <p className="text-[10px] text-slate-500 truncate">Release upon OTP check</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 truncate">MoMo Native</h4>
              <p className="text-[10px] text-slate-500 truncate">MTN & Telecel Cash</p>
            </div>
          </div>
        </div>

        {/* STORES NEAR YOU SECTION (Live Database Stores with interactive filter) */}
        <section id="stores-section" className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <StoreIcon className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Verified Stores Near You
              </h2>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                Tamale Metropolis
              </span>
            </div>

            {selectedStore && (
              <button
                type="button"
                onClick={() => setSelectedStore("")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Clear store filter ({selectedStore})</span>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {stores.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
              Loading local verified stores...
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
              {stores.map((store) => {
                const isStoreActive =
                  selectedStore.toLowerCase() === store.name.toLowerCase();

                return (
                  <button
                    key={store._id}
                    type="button"
                    onClick={() =>
                      setSelectedStore(isStoreActive ? "" : store.name)
                    }
                    className={`w-64 sm:w-72 rounded-2xl p-3 border transition-all flex items-center gap-3 shrink-0 text-left cursor-pointer ${
                      isStoreActive
                        ? "bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                        : "bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-md shadow-xs"
                    }`}
                  >
                    {/* Store Avatar / Logo */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center font-black text-sm shrink-0 border border-slate-100 shadow-inner">
                      {store.name[0]}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-black text-slate-900 truncate">
                          {store.name}
                        </h3>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                      </div>

                      <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                        <span>{store.area}</span>
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="font-bold text-amber-600 flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          <span>{store.rating.toFixed(1)}</span>
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                          {store.productCount} items
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* DYNAMIC FLASH DEALS SHELF */}
        {flashDeals.length > 0 && !selectedSubcategory && (
          <section className="bg-gradient-to-r from-blue-900/5 via-blue-800/10 to-transparent rounded-3xl p-4 sm:p-5 border border-blue-200/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white font-black shadow-xs">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>Tamale Flash Deals & Discounts</span>
                    <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Limited Time
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500">Unbeatable prices from local Tamale merchants</p>
                </div>
              </div>

              {/* Countdown clock */}
              <div className="flex items-center gap-1.5 text-xs font-mono font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Horizontal Deals Carousel */}
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {flashDeals.map((item) => {
                const discount = item.compareAtPrice
                  ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
                  : 15;

                return (
                  <Link
                    key={item._id}
                    href={`/products/${item._id}`}
                    className="w-40 sm:w-48 bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs shrink-0 flex flex-col justify-between group hover:border-blue-400 hover:shadow-md transition"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={item.images?.[0]?.url || "https://images.unsplash.com/photo-1544441893-675973e31985?w=300&auto=format&fit=crop&q=60"}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs">
                        -{discount}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">
                        {item.name}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                          {formatGHS(item.price)}
                        </span>
                        {item.compareAtPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatGHS(item.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* DYNAMIC PRODUCT BOARD (Categorized, Filtered & Interactive) */}
        <section id="product-board" className="space-y-4 pt-1">
          {/* Active Filter Banner if Category, Subcategory or Store is Active */}
          {(selectedCategory !== "all" || selectedSubcategory || selectedStore) && (
            <div className="p-3.5 bg-white rounded-2xl border border-blue-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900">Active Filters:</span>
                {selectedCategory !== "all" && (
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-xl border border-blue-200 flex items-center gap-1.5">
                    <span>{selectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedSubcategory("");
                      }}
                      className="hover:text-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedSubcategory && (
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <span>{selectedSubcategory}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategory("")}
                      className="hover:text-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedStore && (
                  <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <StoreIcon className="h-3 w-3 text-emerald-600" />
                    <span>Store: {selectedStore}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedStore("")}
                      className="hover:text-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Subcategory Filter Pills (If category is selected) */}
          {currentCategoryGroups && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Explore in {selectedCategory}:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory("")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                    !selectedSubcategory
                      ? "bg-slate-900 text-white font-black"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  All {selectedCategory}
                </button>
                {currentCategoryGroups.flatMap((g) => g.items).slice(0, 14).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelectedSubcategory(item === selectedSubcategory ? "" : item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                      selectedSubcategory === item
                        ? "bg-blue-600 text-white font-black shadow-xs"
                        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BOARD CHANNELS BAR (Transforms between All, Flash Deals, Under 100, Top Rated, In-Stock) */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
              {[
                { id: "ALL", label: "All Items" },
                { id: "FLASH_DEALS", label: "🔥 Deals & Discounts" },
                { id: "UNDER_100", label: "⚡ Under GH₵ 100" },
                { id: "TOP_RATED", label: "⭐ Top Rated (4.8+)" },
                { id: "FAST_DISPATCH", label: "📦 In-Stock" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setBoardViewMode(mode.id as BoardViewMode)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    boardViewMode === mode.id
                      ? "bg-blue-600 text-white font-black shadow-xs"
                      : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-bold shrink-0 hidden sm:inline">
              {displayedProducts.length} items available
            </span>
          </div>

          {/* PRODUCTS GRID */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 py-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-3 border border-slate-200 animate-pulse space-y-2.5">
                  <div className="aspect-square w-full bg-slate-100 rounded-xl" />
                  <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-black text-slate-800">No products found for this view</p>
              <p className="text-xs text-slate-400">
                Try switching categories, clearing the store filter, or searching for other items.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayedProducts.map((product) => {
                const imgUrl =
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60";
                const isOutOfStock = product.inventory?.available <= 0;
                const originalPrice = product.compareAtPrice || Math.round(product.price * 1.15);
                const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
                const inCartQty = getCartItemQty(product._id);

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 p-3 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Image Container */}
                    <Link
                      href={`/products/${product._id}`}
                      className="block relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100"
                    >
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Discount Tag */}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-rose-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-xs">
                          -{discount}%
                        </span>
                      )}

                      {/* Fast delivery badge */}
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white font-black text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Zap className="h-2 w-2 text-blue-400" />
                        <span>Tamale Metro</span>
                      </span>
                    </Link>

                    {/* Product Details */}
                    <div className="pt-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Store Tag */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <StoreIcon className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                          <span className="font-bold text-slate-700 truncate">
                            {product.storeId?.name || "Tamale Merchant"}
                          </span>
                        </div>

                        {/* Title */}
                        <Link
                          href={`/products/${product._id}`}
                          className="block text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug mt-1"
                        >
                          {product.name}
                        </Link>
                      </div>

                      {/* Rating & Stock */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-slate-800">
                            {product.rating?.average?.toFixed(1) || "4.8"}
                          </span>
                        </div>
                        <span className="text-emerald-600 font-bold">
                          {product.inventory?.available > 0
                            ? `In Stock (${product.inventory.available})`
                            : "Out of stock"}
                        </span>
                      </div>

                      {/* Price Row & Add to Cart Controls */}
                      <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100">
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-black text-slate-900 font-mono tracking-tight truncate">
                            {formatGHS(product.price)}
                          </p>
                          {product.compareAtPrice && (
                            <p className="text-[9px] text-slate-400 line-through truncate">
                              {formatGHS(product.compareAtPrice)}
                            </p>
                          )}
                        </div>

                        {/* Cart Button or Stepper */}
                        {inCartQty > 0 ? (
                          <div className="flex items-center border border-blue-200 rounded-xl bg-blue-50/80 p-0.5 shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(product._id, inCartQty - 1)}
                              className="p-1 hover:bg-blue-100 rounded-lg text-blue-700 transition active:scale-90"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-black text-blue-800">
                              {inCartQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(product._id, inCartQty + 1)}
                              className="p-1 hover:bg-blue-100 rounded-lg text-blue-700 transition active:scale-90"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
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
                            className={`px-3 py-1.5 rounded-xl transition font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 ${
                              isOutOfStock
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MOBILE FLOATING BOTTOM CART BAR (Visible when items are in cart) */}
      {itemCount > 0 && !isCartOpen && (
        <div className="sm:hidden fixed bottom-4 inset-x-4 z-40 animate-in fade-in slide-in-from-bottom-3">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-blue-600 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between font-bold text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white text-blue-700 font-black px-2 py-0.5 rounded-full text-xs">
                {itemCount}
              </span>
              <span>View Cart</span>
            </div>
            <div className="flex items-center gap-2 font-mono font-black text-sm">
              <span>{formatGHS(subtotal)}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* SLIDE-OUT CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                    <span>My Shopping Basket</span>
                  </h2>
                  <p className="text-[11px] text-slate-500">{itemCount} items selected</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Your basket is empty</p>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Browse Tamale deals & stores →
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <StoreIcon className="h-2.5 w-2.5 text-blue-500" />
                          <span>{item.storeName || "Tamale Merchant"}</span>
                        </p>
                        <p className="text-xs font-black text-slate-900 font-mono">
                          {formatGHS(item.price)}
                        </p>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-slate-50 rounded-lg text-slate-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
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
                        className="p-1 text-slate-300 hover:text-rose-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Summary & Checkout */}
              {cartItems.length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-800">{formatGHS(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tamale Local Delivery</span>
                      <span className="font-bold text-slate-800">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                      <span>Total</span>
                      <span className="text-blue-600 font-mono">{formatGHS(subtotal)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Tamale Checkout</span>
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

export default function CustomerMarketplace() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-bold">Loading NorthMarket Tamale...</p>
          </div>
        </div>
      }
    >
      <CustomerMarketplaceContent />
    </Suspense>
  );
}
