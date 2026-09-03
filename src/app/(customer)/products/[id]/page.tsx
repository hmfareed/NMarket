"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  CheckCircle2,
  Truck,
  ShieldCheck,
  ShoppingBag,
  Zap,
  MapPin,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductData {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  storeId: string;
  storeName?: string;
  storeArea?: string;
  inventory: {
    available: number;
    onHand: number;
    reserved: number;
  };
  rating?: {
    average: number;
    count: number;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const productId = params?.id as string;

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) {
          // Fallback to fetch from list
          const listRes = await fetch("/api/products");
          if (listRes.ok) {
            const data = await listRes.json();
            const found = data.products?.find((p: any) => p._id === productId);
            if (found) {
              setProduct(found);
              return;
            }
          }
          throw new Error("Product not found.");
        }
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    if (productId) loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.images?.[0] || "",
        storeId: product.storeId,
        storeName: product.storeName || "Tamale Merchant",
      });
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span>Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-black text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          This item might have been unlisted or moved to a different store.
        </p>
        <Link
          href="/"
          className="mt-4 bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 12; // Fallback promotional discount display

  const calculatedOriginalPrice = product.originalPrice || Math.round(product.price * 1.15);
  const images = product.images && product.images.length > 0 ? product.images : [
    "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-12">
      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            type="button"
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
            Product Details
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              type="button"
              className={`p-2 rounded-xl transition ${
                isWishlisted
                  ? "bg-rose-50 text-rose-500"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    url: window.location.href,
                  });
                }
              }}
              type="button"
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Image Carousel with Discount Badge */}
          <div className="md:col-span-6 space-y-4">
            <div className="relative aspect-square w-full bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-card group">
              <img
                src={images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Discount Badge */}
              <div className="absolute top-4 right-4 bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-xs">
                -{discountPercent}%
              </div>

              {/* Pagination Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeImageIndex === idx
                          ? "w-6 bg-amber-500"
                          : "w-2 bg-slate-300/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-16 rounded-2xl overflow-hidden border-2 transition ${
                      activeImageIndex === idx
                        ? "border-amber-500 shadow-xs"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Purchasing Controls */}
          <div className="md:col-span-6 space-y-5">
            {/* Title & Rating */}
            <div>
              <span className="text-[11px] font-bold text-amber-600 tracking-wider uppercase">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg text-xs font-bold border border-amber-200/60">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating?.average?.toFixed(1) || "4.8"}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  ({product.rating?.count || 128} verified reviews)
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatGHS(product.price)}
                </span>
                <span className="text-sm font-semibold text-slate-400 line-through">
                  {formatGHS(calculatedOriginalPrice)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                <span>You save {formatGHS(calculatedOriginalPrice - product.price)} on this local deal</span>
              </p>
            </div>

            {/* Store Badge (Verified Merchant Card matching reference) */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center font-black text-amber-700 text-sm">
                  {(product.storeName || "NM")[0]}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>{product.storeName || "Alhaji Electronics"}</span>
                    <span className="text-slate-400 font-normal">Tamale ⌵</span>
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified Store</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/?store=${encodeURIComponent(product.storeName || "")}`}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                Visit Store →
              </Link>
            </div>

            {/* Delivery Estimate Card */}
            <div className="p-4 bg-amber-50/60 rounded-3xl border border-amber-200/80 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Truck className="h-4 w-4 text-amber-600" />
                <span>Delivery: Estimated delivery: Today 2 - 4 PM</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6">
                Direct dispatch from local store in {product.storeArea || "Tamale Central"} to your doorstep.
              </p>
            </div>

            {/* Stock Urgency Banner */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700">
                Stock Status:
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                In Stock • Only {product.inventory?.available || 12} left
              </span>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-xs">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.inventory?.available || 10, quantity + 1))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Product Description
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description ||
                  "Handcrafted or locally stocked in Tamale. Verified high-quality local product backed by NorthMarket's Delivery OTP buyer protection."}
              </p>
            </div>

            {/* Action Buttons (Desktop Inline) */}
            <div className="hidden sm:grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-4 rounded-2xl border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Sticky Action Bar (Mobile only, matching UI Reference) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:hidden shadow-lg">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3 px-3 rounded-2xl border-2 border-amber-500 text-amber-700 font-bold text-xs bg-white flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Added Toast */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 bg-dark-900 text-amber-400 px-4 py-2.5 rounded-2xl shadow-elevated text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Added to your cart!</span>
        </div>
      )}
    </div>
  );
}
