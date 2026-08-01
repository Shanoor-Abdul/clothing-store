"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Calendar, TrendingUp, ShoppingBag, Layers, AlertTriangle, RefreshCw } from "lucide-react";
import api from "@/lib/axios";
import { formatCurrency } from "@/utils";

interface CategoryRevenue {
  name: string;
  salesCount: number;
  totalRevenue: number;
}

interface CollectionRevenue {
  name: string;
  salesCount: number;
  totalRevenue: number;
}

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  categoryName: string;
  unitsSold: number;
  totalRevenue: number;
  stock: number;
}

interface RevenueData {
  summary: {
    grossRevenue: number;
    ordersCount: number;
    deliveredCount: number;
  };
  revenueByCategory: CategoryRevenue[];
  revenueByCollection: CollectionRevenue[];
  topSellingProducts: TopProduct[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const fetchRevenue = async (range: string, month: string): Promise<RevenueData> => {
  const query = new URLSearchParams({ range });
  if (range === "MONTH" && month) query.set("month", month);
  const { data } = await api.get<ApiResponse<RevenueData>>(`/admin/revenue?${query.toString()}`);
  return data.data;
};

export default function AdminRevenuePage() {
  const [range, setRange] = useState<string>("THIS_MONTH");
  const [customMonth, setCustomMonth] = useState<string>("");

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["admin", "revenue", range, customMonth],
    queryFn: () => fetchRevenue(range, customMonth),
  });

  const summary = data?.summary || { grossRevenue: 0, ordersCount: 0, deliveredCount: 0 };
  const categories = data?.revenueByCategory || [];
  const collections = data?.revenueByCollection || [];
  const topProducts = data?.topSellingProducts || [];

  const maxCatRev = Math.max(1, ...categories.map((c) => c.totalRevenue));
  const maxColRev = Math.max(1, ...collections.map((c) => c.totalRevenue));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Revenue & Sales Analytics</h1>
          <p className="mt-1 text-slate-500">Track earnings, bestseller products, and category performance.</p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw size={16} className={isRefetching ? "animate-spin text-blue-600" : ""} />
          {isRefetching ? "Updating..." : "Refresh Data"}
        </button>
      </div>

      {/* Date Range Selection Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar size={16} className="text-blue-600" /> Filter Timeframe:
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "TODAY", label: "Today" },
            { id: "LAST_7_DAYS", label: "Last 7 Days" },
            { id: "THIS_MONTH", label: "This Month" },
            { id: "MONTH", label: "Select Month" },
            { id: "ALL", label: "All Time" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRange(item.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                range === item.id
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}

          {range === "MONTH" && (
            <input
              type="month"
              value={customMonth}
              onChange={(e) => setCustomMonth(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs outline-none focus:border-blue-500 font-bold"
            />
          )}
        </div>
      </div>

      {/* Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-900 to-slate-900 p-6 text-white shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-200">
            <span>Gross Revenue</span>
            <DollarSign size={20} className="text-blue-300" />
          </div>
          <p className="text-3xl font-black">{formatCurrency(summary.grossRevenue)}</p>
          <p className="text-[11px] text-blue-200">Total generated from delivered & paid orders</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Delivered Orders</span>
            <ShoppingBag size={20} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{summary.deliveredCount}</p>
          <p className="text-[11px] text-slate-400">Successfully completed orders</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Avg Order Value</span>
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {summary.ordersCount > 0
              ? formatCurrency(summary.grossRevenue / summary.ordersCount)
              : formatCurrency(0)}
          </p>
          <p className="text-[11px] text-slate-400">Across {summary.ordersCount} orders in period</p>
        </div>
      </div>

      {/* Breakdown Charts: Categories & Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers size={18} className="text-blue-600" /> Revenue by Category
          </h3>
          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No category sales data for selected period.</p>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => {
                const pct = Math.min(100, Math.round((cat.totalRevenue / maxCatRev) * 100));
                return (
                  <div key={cat.name} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{cat.name} ({cat.salesCount} sold)</span>
                      <span>{formatCurrency(cat.totalRevenue)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue by Collection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers size={18} className="text-purple-600" /> Revenue by Collection
          </h3>
          {collections.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No collection sales data for selected period.</p>
          ) : (
            <div className="space-y-4">
              {collections.map((col) => {
                const pct = Math.min(100, Math.round((col.totalRevenue / maxColRev) * 100));
                return (
                  <div key={col.name} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{col.name} ({col.salesCount} sold)</span>
                      <span>{formatCurrency(col.totalRevenue)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bestseller Products Analytics Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Bestseller Products & Inventory Demand</h3>
            <p className="text-xs text-slate-500">Track high-demand items to restock before inventory empties</p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading sales analytics...</div>
        ) : topProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No product sales recorded for this timeframe.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Units Sold</th>
                  <th className="p-3">Total Revenue</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3 text-right">Stock Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.map((prod) => {
                  const isLowStock = prod.stock <= 5 && prod.stock > 0;
                  const isOutOfStock = prod.stock === 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{prod.name}</td>
                      <td className="p-3 text-slate-500 font-mono">{prod.sku}</td>
                      <td className="p-3 text-slate-600">{prod.categoryName}</td>
                      <td className="p-3 font-bold text-slate-900">{prod.unitsSold} units</td>
                      <td className="p-3 font-bold text-blue-600">{formatCurrency(prod.totalRevenue)}</td>
                      <td className="p-3 font-semibold text-slate-800">{prod.stock} left</td>
                      <td className="p-3 text-right">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-800">
                            <AlertTriangle size={12} /> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800">
                            <AlertTriangle size={12} /> Restock Soon
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                            Sufficient Stock
                          </span>
                        )}
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
