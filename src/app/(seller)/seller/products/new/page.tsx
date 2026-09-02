"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

interface CategoryOption {
  slug: string;
  name: string;
}

const PRESET_PRODUCTS = [
  {
    title: "iPhone 13 Pro 128GB - Sierra Blue",
    category: "phones-tech",
    brand: "Apple",
    price: 6500,
    compareAtPrice: 7200,
    onHand: 5,
    description: "Mint condition, battery health 92%. Factory unlocked, comes with original box and fast charger. Available for immediate pickup in Tamale.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60",
  },
  {
    title: "Handwoven Dagbon Traditional Smock (Fugu)",
    category: "fashion-smocks",
    brand: "Northern Artisans",
    price: 350,
    compareAtPrice: 420,
    onHand: 12,
    description: "100% authentic handwoven heavy cotton Northern Ghanaian smock. Made in Tamale with traditional embroidery. Size Large.",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=60",
  },
  {
    title: "Raw Unrefined Northern Shea Butter (1kg)",
    category: "shea-beauty",
    brand: "Savannah Natural",
    price: 45,
    compareAtPrice: 55,
    onHand: 50,
    description: "Grade A organic raw golden unrefined shea butter from Northern Ghana. Deeply moisturizing, 100% natural, chemical-free.",
    imageUrl: "https://images.unsplash.com/photo-1608248597359-25f0a82b4dc2?w=600&auto=format&fit=crop&q=60",
  },
];

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [onHand, setOnHand] = useState("10");
  const [lowStockThreshold, setLowStockThreshold] = useState("2");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (data.categories?.length > 0) {
            setCategory(data.categories[0].slug);
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  const applyPreset = (preset: typeof PRESET_PRODUCTS[0]) => {
    setName(preset.title);
    setCategory(preset.category);
    setBrand(preset.brand);
    setPrice(preset.price.toString());
    setCompareAtPrice(preset.compareAtPrice.toString());
    setOnHand(preset.onHand.toString());
    setDescription(preset.description);
    setImageUrl(preset.imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          brand,
          description,
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
          onHand: Number(onHand),
          lowStockThreshold: Number(lowStockThreshold),
          images: imageUrl ? [{ url: imageUrl, isPrimary: true }] : [],
          status: "PUBLISHED",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product.");
      }

      router.push("/seller/products");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/seller/products"
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900">Add New Product</h1>
              <p className="text-xs text-slate-500">
                Publish an item to buyers across the Tamale metropolis
              </p>
            </div>
          </div>
        </div>

        {/* Preset Sample Autofill */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Fast Autofill Samples (Northern Ghana Favorites):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_PRODUCTS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-[11px] font-bold bg-white text-emerald-800 hover:bg-emerald-100/50 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
              >
                + {p.title.split("-")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Basic Product Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. iPhone 13 Pro 128GB or Handwoven Fugu Smock"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Marketplace Category *
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand / Maker (Optional)
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, Samsung, or Local Artisan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Specifications
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide accurate details (condition, warranty, sizes, ingredients)..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Two-Tier Inventory */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Pricing & Stock Levels</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Currency: Ghana Cedi (GH₵)
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selling Price (GH₵) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Original Price / Strike-through (GH₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="Optional comparison price"
                  className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physical Stock On Hand (Units) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={onHand}
                  onChange={(e) => setOnHand(e.target.value)}
                  className="w-full px-3.5 py-2.5 font-bold bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Initial available stock will match units on hand.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Low Stock Warning Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Alerts you when stock falls below this quantity.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Product Image */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Product Photo
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Image Web Link (URL)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {imageUrl && (
              <div className="mt-3 flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={imageUrl}
                  alt="Product Preview"
                  className="h-20 w-20 rounded-xl object-cover border border-slate-200 bg-white"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Image Preview Ready</p>
                  <p className="text-[11px] text-slate-400">
                    High quality photo will be displayed in customer search results.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/seller/products"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 py-3 px-5 rounded-xl border border-slate-200 bg-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 px-8 rounded-xl shadow-sm transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing Product...</span>
                </>
              ) : (
                <>
                  <span>Publish to Tamale Marketplace</span>
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
