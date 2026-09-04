"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Loader2,
  RefreshCw,
  X,
  Check,
  Tag,
  Store as StoreIcon,
  Flame,
  ExternalLink,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface ProductItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  inventory: { available: number };
  images: { url: string }[];
  storeId?: {
    _id: string;
    name: string;
    slug: string;
    address?: { area: string };
  };
  createdAt: string;
}

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, published: 0, draft: 0, outOfStock: 0 });

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  // Editing state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCompareAt, setEditCompareAt] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<string>("PUBLISHED");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (stockFilter !== "ALL") params.set("stock", stockFilter);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, statusFilter, stockFilter]);

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setEditPrice(p.price);
    setEditCompareAt(p.compareAtPrice || 0);
    setEditStock(p.inventory?.available || 0);
    setEditStatus(p.status);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingProduct._id,
          price: Number(editPrice),
          compareAtPrice: Number(editCompareAt) || undefined,
          stockAvailable: Number(editStock),
          status: editStatus,
        }),
      });

      if (res.ok) {
        setEditingProduct(null);
        await fetchProducts();
      }
    } catch (err) {
      console.error("Failed to update product:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (p: ProductItem) => {
    const nextStatus = p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: p._id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item._id === p._id ? { ...item, status: nextStatus as any } : item))
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Marketplace Products Catalog</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
              Tamale Inventory
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee, moderate, unpublish, and adjust prices/stock across all stores in Tamale.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProducts}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Catalog</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{counts.total || products.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Published & Live</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{counts.published}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Draft / Moderated</p>
          <p className="text-2xl font-black text-slate-700 mt-1">{counts.draft}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{counts.outOfStock}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, brand, store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Live / Published</option>
              <option value="DRAFT">Draft / Unlisted</option>
            </select>
          </div>

          {/* Stock filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock (&gt; 5)</option>
              <option value="LOW_STOCK">Low Stock (1 - 5)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Package className="h-10 w-10 text-slate-200 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No products match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isPublished = p.status === "PUBLISHED";
                  const stock = p.inventory?.available ?? 0;
                  const isLow = stock > 0 && stock <= 5;
                  const isOut = stock <= 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1544441893-675973e31985?w=100"}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-100"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                            <span className="text-[10px] text-slate-400">ID: {p._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Store */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{p.storeId?.name || "Tamale Store"}</p>
                        <p className="text-[10px] text-slate-400">{p.storeId?.address?.area || "Tamale Central"}</p>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {p.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <p className="font-black font-mono text-slate-900">{formatGHS(p.price)}</p>
                        {p.compareAtPrice && (
                          <p className="text-[10px] text-slate-400 line-through font-mono">
                            {formatGHS(p.compareAtPrice)}
                          </p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                            Out of stock
                          </span>
                        ) : isLow ? (
                          <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            Low ({stock})
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-700 font-mono">
                            {stock} available
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                          }`}
                          title="Click to toggle status"
                        >
                          {isPublished ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          <span>{isPublished ? "Live" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${p._id}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
                            title="View on Customer App"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-dark-900 hover:text-emerald-400 text-slate-700 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Adjust Product: {editingProduct.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Selling Price (GH₵)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Compare-At Original Price (GH₵)</label>
                <input
                  type="number"
                  value={editCompareAt}
                  onChange={(e) => setEditCompareAt(Number(e.target.value))}
                  placeholder="e.g. 500 (optional for discount tag)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Moderation Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                >
                  <option value="PUBLISHED">PUBLISHED (Live on Tamale Board)</option>
                  <option value="DRAFT">DRAFT (Hidden / Under Review)</option>
                  <option value="ARCHIVED">ARCHIVED (Permanently Retired)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
