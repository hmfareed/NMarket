"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface ProductItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  status: "PUBLISHED" | "DRAFT" | "PENDING_REVIEW" | "REJECTED";
  images: { url: string; isPrimary: boolean }[];
  inventory: {
    onHand: number;
    reserved: number;
    available: number;
    lowStockThreshold: number;
  };
  createdAt: string;
}

export default function SellerProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [storeName, setStoreName] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({
    total: 0,
    published: 0,
    draft: 0,
    lowStock: 0,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seller/products?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCounts(data.counts || { total: 0, published: 0, draft: 0, lowStock: 0 });
        setStoreName(data.storeName || "");
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const toggleStatus = async (product: ProductItem) => {
    const nextStatus = product.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/seller/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Merchant Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight">
                NMarket <span className="text-emerald-600 font-medium text-sm">Merchant</span>
              </span>
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-xs font-bold text-slate-700">{storeName || "Product Catalog"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/seller"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400">Total Products</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{counts.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400">Live in Tamale</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{counts.published}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400">Drafts / Inactive</p>
            <p className="text-2xl font-black text-slate-500 mt-1">{counts.draft}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400">Low Stock Alert</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{counts.lowStock}</p>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <Filter className="h-3 w-3 text-slate-400 ml-2" />
            {[
              { id: "ALL", label: `All (${counts.total})` },
              { id: "PUBLISHED", label: `Published (${counts.published})` },
              { id: "DRAFT", label: `Draft (${counts.draft})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 flex justify-center items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              <span>Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-3">
              <Package className="h-10 w-10 mx-auto text-slate-300" />
              <p>No products found in this view.</p>
              <Link
                href="/seller/products/new"
                className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Your First Product</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price (GHS)</th>
                    <th className="py-3.5 px-4">Inventory</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProducts.map((p) => {
                    const primaryImg = p.images?.[0]?.url || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200";
                    const isLowStock = p.inventory.available <= p.inventory.lowStockThreshold;

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={primaryImg}
                              alt={p.name}
                              className="h-12 w-12 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block line-clamp-1">{p.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {p._id.slice(-6)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[11px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-black text-slate-900">{formatGHS(p.price)}</span>
                          {p.compareAtPrice && (
                            <span className="text-[10px] text-slate-400 line-through block">
                              {formatGHS(p.compareAtPrice)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-black text-xs ${
                                isLowStock ? "text-amber-600" : "text-emerald-700"
                              }`}
                            >
                              {p.inventory.available} available
                            </span>
                            {isLowStock && (
                              <span title="Low stock threshold reached">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {p.inventory.onHand} on hand ({p.inventory.reserved} reserved)
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => toggleStatus(p)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                              p.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {p.status === "PUBLISHED" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Published</span>
                              </>
                            ) : (
                              <span>Draft</span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteProduct(p._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
