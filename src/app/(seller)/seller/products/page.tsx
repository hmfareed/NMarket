"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  ChevronDown,
  Edit2,
  Eye,
  Trash2,
  Loader2,
  ArrowRight,
  Filter,
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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seller/products?status=ALL`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || p.category.toLowerCase() === categoryFilter.toLowerCase();
    const stockStatus =
      p.inventory.available <= 0
        ? "OUT_OF_STOCK"
        : p.inventory.available <= (p.inventory.lowStockThreshold || 2)
        ? "LOW_STOCK"
        : "IN_STOCK";
    const matchesStatus =
      statusFilter === "ALL" || stockStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Row matching UI Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Products
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your store catalog and live Tamale inventory
          </p>
        </div>

        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-xs transition"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter Toolbar matching UI Reference */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="relative flex-1 md:w-44">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 appearance-none outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative flex-1 md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 appearance-none outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products Table matching UI Reference */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No products match your filter</p>
            <Link
              href="/seller/products/new"
              className="inline-block text-xs font-bold text-amber-600 hover:underline"
            >
              + Create your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => {
                  const img =
                    p.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1544441893-675973e31985?w=200&auto=format&fit=crop&q=60";
                  const isOut = p.inventory.available <= 0;
                  const isLow =
                    !isOut && p.inventory.available <= (p.inventory.lowStockThreshold || 2);

                  return (
                    <tr key={p._id} className="hover:bg-amber-50/30 transition">
                      {/* Product Name & Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-black text-slate-900 font-mono">
                        {formatGHS(p.price)}
                      </td>

                      {/* Stock Count */}
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {p.inventory.available}
                      </td>

                      {/* Status Pill */}
                      <td className="px-6 py-4">
                        {isOut ? (
                          <span className="inline-block text-[10px] font-black bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-block text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Action Icons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p._id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                            title="View in Customer Store"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/seller/products/new?edit=${p._id}`}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
