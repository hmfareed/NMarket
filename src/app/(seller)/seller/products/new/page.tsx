"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  UploadCloud,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function AddNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Phones & Electronics");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("12");
  const [sku, setSku] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60",
  ]);
  const [customImageUrl, setCustomImageUrl] = useState("");

  const categories = [
    "Phones & Electronics",
    "Fashion",
    "Shoes",
    "Beauty & Personal Care",
    "Groceries & Foodstuffs",
    "Home & Living",
    "Baby & Kids",
    "Computers & Tech",
    "Appliances",
    "Accessories",
    "Sports & Fitness",
    "Local Crafts & Shea",
  ];

  const handleAddImage = () => {
    if (!customImageUrl.trim()) return;
    setImageUrls([...imageUrls, customImageUrl.trim()]);
    setCustomImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  const handlePublish = async (status: "PUBLISHED" | "DRAFT") => {
    if (!name.trim() || !price) {
      setError("Please provide a product title and price.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          price: parseFloat(price),
          compareAtPrice: discountPrice ? parseFloat(discountPrice) : undefined,
          description: description.trim(),
          onHand: parseInt(stockQuantity) || 10,
          sku: sku.trim() || undefined,
          images: imageUrls.map((url, idx) => ({ url, isPrimary: idx === 0 })),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product.");
      }

      router.push("/seller/products");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header matching UI Reference */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/seller/products"
            className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Add New Product
            </h1>
            <p className="text-xs text-slate-500">
              Create a new item in your Tamale merchant catalog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handlePublish("DRAFT")}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handlePublish("PUBLISHED")}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-xs transition flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Publish Product</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-COLUMN FORM LAYOUT matching UI DESIGN.jpg reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Basic Information & Inventory */}
        <div className="lg:col-span-7 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              Basic Information
            </h2>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samsung Galaxy A15 or Handwoven Dagbon Smock"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price & Discount Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Price (GH₵) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 2499.00"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/30 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Original Price (GH₵ Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="e.g. 2850.00 (shown crossed out)"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key specs, condition, or origin in Tamale..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/30 leading-relaxed"
              />
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              Inventory
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/30 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  SKU (Optional)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. SAM-A15-BLU"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Images matching UI Reference */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              Product Images
            </h2>

            {/* Drag & Drop Upload Zone */}
            <div className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-3xl p-6 text-center space-y-2 bg-slate-50/50 hover:bg-amber-50/20 transition cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Drag & drop images here
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  or click to paste image URL
                </p>
              </div>
            </div>

            {/* Add Image URL Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Paste web image URL..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-3 py-2 bg-dark-900 text-amber-400 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>

            {/* Thumbnail Preview Strip matching UI reference */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Gallery Thumbnails ({imageUrls.length})
              </span>
              <div className="grid grid-cols-4 gap-2">
                {imageUrls.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-dark-900/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 font-black text-[8px] px-1.5 py-0.2 rounded-md">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
