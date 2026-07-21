"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";

import api from "@/lib/axios";
import { formatCurrency } from "@/utils";
import ProductCard from "../components/ProductCard";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const fetchProducts = async (url: string) => {
  const { data } = await api.get<ApiResponse<any[]>>(url);
  return data.data;
};

const fetchCategories = async () => {
  const { data } = await api.get<ApiResponse<any[]>>("/categories");
  return data.data;
};

const fetchColors = async () => {
  const { data } = await api.get<ApiResponse<any[]>>("/colors");
  return data.data;
};

const fetchSizes = async () => {
  const { data } = await api.get<ApiResponse<any[]>>("/sizes");
  return data.data;
};

const fetchCollections = async () => {
  const { data } = await api.get<ApiResponse<any[]>>("/collections");
  return data.data;
};

const ProductsPageInner = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const color = searchParams.get("color");
  const size = searchParams.get("size");
  const collection = searchParams.get("collection");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (search) query.set("search", search);
  if (featured) query.set("featured", featured);
  if (color) query.set("color", color);
  if (size) query.set("size", size);
  if (collection) query.set("collection", collection);
  if (minPrice) query.set("minPrice", minPrice);
  if (maxPrice) query.set("maxPrice", maxPrice);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "list", query.toString()],
    queryFn: () => fetchProducts(`/products?${query.toString()}`),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: fetchCategories,
  });

  const { data: colors = [] } = useQuery({
    queryKey: ["colors", "list"],
    queryFn: fetchColors,
  });

  const { data: sizes = [] } = useQuery({
    queryKey: ["sizes", "list"],
    queryFn: fetchSizes,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections", "list"],
    queryFn: fetchCollections,
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/products");
  };

  const hasActiveFilters = category || search || featured || color || size || collection || minPrice || maxPrice;

  const title = search
    ? `Search: "${search}"`
    : featured
    ? "Featured Products"
    : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <aside className="space-y-4">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-200"
            >
              Clear All Filters
            </button>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Category</h3>
              <Link
                href="/products"
                className={`block rounded px-2 py-1 text-sm ${!category ? "bg-blue-50 font-medium text-blue-600" : "hover:bg-slate-50"}`}
              >
                All Categories
              </Link>
              {categories.filter((c: any) => c.isActive).map((c: any) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  className={`block rounded px-2 py-1 text-sm ${category === c.id ? "bg-blue-50 font-medium text-blue-600" : "hover:bg-slate-50"}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {/* Color Filter */}
          {colors.length > 0 && (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Color</h3>
              {colors.filter((c: any) => c.isActive).map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter("color", color === c.id ? "" : c.id)}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-sm w-full text-left ${color === c.id ? "bg-blue-50 font-medium text-blue-600" : "hover:bg-slate-50"}`}
                >
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: c.hex || c.name.toLowerCase() }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Size Filter */}
          {sizes.length > 0 && (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Size</h3>
              {sizes.filter((s: any) => s.isActive).map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => updateFilter("size", size === s.id ? "" : s.id)}
                  className={`block rounded px-2 py-1 text-sm ${size === s.id ? "bg-blue-50 font-medium text-blue-600" : "hover:bg-slate-50"}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {/* Collection Filter */}
          {collections.length > 0 && (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Collection</h3>
              {collections.filter((c: any) => c.isActive).map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter("collection", collection === c.id ? "" : c.id)}
                  className={`block rounded px-2 py-1 text-sm ${collection === c.id ? "bg-blue-50 font-medium text-blue-600" : "hover:bg-slate-50"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Price Filter */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Price Range</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice || ""}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                className="w-full rounded border px-2 py-1 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice || ""}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="rounded-xl border bg-white p-8 text-center">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ProductsPageInner />
    </Suspense>
  );
}