"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import api from "@/lib/axios";
import ProductCard from "../components/ProductCard";
import { Category } from "@/features/category/types/category";
import { Color } from "@/features/color/types/color";
import { Size } from "@/features/size/types/size";
import { Collection } from "@/features/collection/types/collection";
import { Product } from "@/features/products/types/product";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const fetchProducts = async (url: string) => {
  const { data } = await api.get<ApiResponse<Product[]>>(url);
  return data.data;
};

const fetchCategories = async () => {
  const { data } = await api.get<ApiResponse<Category[]>>("/categories");
  return data.data;
};

const fetchColors = async () => {
  const { data } = await api.get<ApiResponse<Color[]>>("/colors");
  return data.data;
};

const fetchSizes = async () => {
  const { data } = await api.get<ApiResponse<Size[]>>("/sizes");
  return data.data;
};

const fetchCollections = async () => {
  const { data } = await api.get<ApiResponse<Collection[]>>("/collections");
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
      <div className="mb-8 rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-900/5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">
              Browse products, apply filters, and discover your next outfit.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700">
              {products.length} products
            </span>
            {featured && <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-600">Featured only</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="space-y-4 md:sticky md:top-6">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="rounded-3xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Clear All Filters
            </button>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="rounded-[2rem] border bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Category</h3>
              <Link
                href="/products"
                className={`block rounded-2xl px-3 py-2 text-sm transition ${!category ? "bg-blue-600 text-white shadow" : "text-slate-700 hover:bg-slate-50"}`}
              >
                All Categories
              </Link>
              {categories.filter((c) => c.isActive).map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  className={`block rounded-2xl px-3 py-2 text-sm transition ${category === c.id ? "bg-blue-600 text-white shadow" : "text-slate-700 hover:bg-slate-50"}`}
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
              {colors.filter((c) => c.isActive).map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateFilter("color", color === c.id ? "" : c.id)}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-sm w-full text-left ${color === c.id ? "bg-blue-50 font-medium text-blue-600" : "hover:bg-slate-50"}`}
                >
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: c.hexCode || c.name.toLowerCase() }}
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
              {sizes.filter((s) => s.isActive).map((s) => (
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
              {collections.filter((c) => c.isActive).map((c) => (
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
              {products.map((product: Product) => (
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