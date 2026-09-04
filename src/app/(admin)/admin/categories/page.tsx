"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  FolderTree,
  Loader2,
  RefreshCw,
  X,
  Check,
  Package,
} from "lucide-react";

interface SubGroup {
  title: string;
  items: string[];
}

interface AdminCategory {
  id: string;
  name: string;
  badge?: string;
  groups: SubGroup[];
  productCount: number;
}

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim(),
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewCatName("");
        setNewCatDesc("");
        await fetchCategories();
      }
    } catch (err) {
      console.error("Failed to add category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Marketplace Categories & Taxonomy</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
              Navigation Tree
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the department hierarchy, subcategories, and keyword mappings that feed the customer navigation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCategories}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Departments</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Subcategories</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {categories.reduce((acc, c) => acc + (c.groups?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Indexed Product Items</p>
          <p className="text-2xl font-black text-slate-700 mt-1">
            {categories.reduce((acc, c) => acc + (c.groups?.reduce((gAcc, g) => gAcc + g.items.length, 0) || 0), 0)}+
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter categories (e.g. Appliances, Computing, Shea)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-500 transition"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{cat.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                    </div>
                  </div>
                  {cat.badge && (
                    <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md">
                      {cat.badge}
                    </span>
                  )}
                </div>

                {/* Subcategory Groups */}
                <div className="space-y-2.5 text-xs">
                  {cat.groups?.map((group, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        {group.title}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {group.items.map((item, iIdx) => (
                          <span
                            key={iIdx}
                            className="bg-white border border-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{cat.groups?.length || 0} sub-groups</span>
                <Link
                  href={`/admin/products?category=${encodeURIComponent(cat.name)}`}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  View Products →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Add New Department</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Solar & Renewable Power"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Solar panels, inverters, backup batteries in Tamale."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleAddCategory}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Create Department</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
