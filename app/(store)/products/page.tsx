"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Filter, X, RotateCcw, Check, DollarSign } from "lucide-react";

import api from "@/lib/axios";
import ProductCard from "../components/ProductCard";
import Pagination from "@/components/common/Pagination";
import { ProductCardSkeleton } from "@/components/common/Skeleton";
import CollapsibleFilterGroup from "@/components/common/CollapsibleFilterGroup";
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

interface Brand {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 12;

const fetchProducts = async (url: string) => {
  const { data } = await api.get<ApiResponse<Product[]>>(url);
  return data.data;
};

const fetchCategories = async () => {
  const { data } = await api.get<ApiResponse<Category[]>>("/categories");
  return data.data;
};

const fetchBrands = async () => {
  const { data } = await api.get<ApiResponse<Brand[]>>("/brands");
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
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const color = searchParams.get("color");
  const size = searchParams.get("size");
  const collection = searchParams.get("collection");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  // Local state for Price inputs to prevent triggering API on every keystroke
  const [localMinPrice, setLocalMinPrice] = useState(minPrice || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || "");

  // Sync local price inputs with URL search parameters
  useEffect(() => {
    setLocalMinPrice(minPrice || "");
    setLocalMaxPrice(maxPrice || "");
  }, [minPrice, maxPrice]);

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (brand) query.set("brand", brand);
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
    staleTime: 2 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands", "list"],
    queryFn: fetchBrands,
    staleTime: 5 * 60 * 1000,
  });

  const { data: colors = [] } = useQuery({
    queryKey: ["colors", "list"],
    queryFn: fetchColors,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sizes = [] } = useQuery({
    queryKey: ["sizes", "list"],
    queryFn: fetchSizes,
    staleTime: 5 * 60 * 1000,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections", "list"],
    queryFn: fetchCollections,
    staleTime: 5 * 60 * 1000,
  });

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      setPage(1);
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handleApplyPriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (localMinPrice) params.set("minPrice", localMinPrice);
    else params.delete("minPrice");
    if (localMaxPrice) params.set("maxPrice", localMaxPrice);
    else params.delete("maxPrice");

    setPage(1);
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = useCallback(() => {
    setPage(1);
    setLocalMinPrice("");
    setLocalMaxPrice("");
    router.push("/products");
  }, [router]);

  const hasActiveFilters =
    Boolean(category || brand || search || featured || color || size || collection || minPrice || maxPrice);

  const title = search
    ? `Results for "${search}"`
    : featured
    ? "Featured Drops & Sales"
    : "Apparel Catalog";

  // Pagination
  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const paginatedProducts = products.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const filterContent = (
    <div className="space-y-4">
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
        >
          <RotateCcw size={14} /> Clear All Filters
        </button>
      )}

      {/* Departments / Categories Collapsible */}
      {categories.length > 0 && (
        <CollapsibleFilterGroup
          title="Departments"
          searchable={true}
          searchPlaceholder="Search category..."
        >
          {(searchQuery) => {
            const filteredCategories = categories.filter((c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return (
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                <Link
                  href="/products"
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    !category
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>All Departments</span>
                  {!category && <Check size={14} className="text-white" />}
                </Link>
                {filteredCategories
                  .filter((c) => c.isActive)
                  .map((c) => {
                    const isSelected = category === c.id;
                    return (
                      <Link
                        key={c.id}
                        href={`/products?category=${c.id}`}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? "bg-blue-600 text-white font-bold shadow-sm"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{c.name}</span>
                        {isSelected && <Check size={14} className="text-white" />}
                      </Link>
                    );
                  })}
              </div>
            );
          }}
        </CollapsibleFilterGroup>
      )}

      {/* Brands Multi-filter Collapsible */}
      {brands.length > 0 && (
        <CollapsibleFilterGroup
          title="Brand"
          searchable={true}
          searchPlaceholder="Search brand..."
        >
          {(searchQuery) => {
            const filteredBrands = brands.filter((b) =>
              b.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return (
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredBrands.map((b) => {
                  const isSelected = brand === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => updateFilter("brand", isSelected ? "" : b.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-left transition ${
                        isSelected
                          ? "bg-blue-600 text-white font-bold shadow-sm"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{b.name}</span>
                      {isSelected && <Check size={14} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            );
          }}
        </CollapsibleFilterGroup>
      )}

      {/* Color Swatch Grid Collapsible */}
      {colors.length > 0 && (
        <CollapsibleFilterGroup title="Color" searchable={false}>
          {() => (
            <div className="flex flex-wrap gap-2 pt-1">
              {colors
                .filter((c) => c.isActive)
                .map((c) => {
                  const isSelected = color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      title={c.name}
                      onClick={() => updateFilter("color", isSelected ? "" : c.id)}
                      className={`relative h-7 w-7 rounded-full border border-slate-300 shadow-sm transition hover:scale-110 ${
                        isSelected ? "ring-2 ring-blue-600 ring-offset-2 scale-110" : ""
                      }`}
                      style={{ backgroundColor: c.hexCode || c.name.toLowerCase() }}
                    />
                  );
                })}
            </div>
          )}
        </CollapsibleFilterGroup>
      )}

      {/* Size Pills Collapsible */}
      {sizes.length > 0 && (
        <CollapsibleFilterGroup title="Size" searchable={false}>
          {() => (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sizes
                .filter((s) => s.isActive)
                .map((s) => {
                  const isSelected = size === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => updateFilter("size", isSelected ? "" : s.id)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
            </div>
          )}
        </CollapsibleFilterGroup>
      )}

      {/* Collections Collapsible */}
      {collections.length > 0 && (
        <CollapsibleFilterGroup
          title="Collections"
          searchable={true}
          searchPlaceholder="Search collection..."
        >
          {(searchQuery) => {
            const filteredCollections = collections.filter((c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return (
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredCollections
                  .filter((c) => c.isActive)
                  .map((c) => {
                    const isSelected = collection === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => updateFilter("collection", isSelected ? "" : c.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                          isSelected
                            ? "bg-blue-600 text-white font-bold shadow-sm"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{c.name}</span>
                        {isSelected && <Check size={14} className="text-white" />}
                      </button>
                    );
                  })}
              </div>
            );
          }}
        </CollapsibleFilterGroup>
      )}

      {/* Price Range Filter with explicit Search/Apply button */}
      <CollapsibleFilterGroup title="Price Range ($)" searchable={false}>
        {() => (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none focus:border-blue-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyPriceFilter}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
            >
              <DollarSign size={14} /> Apply Price Filter
            </button>
          </div>
        )}
      </CollapsibleFilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {products.length} available items
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="md:hidden flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow"
        >
          <Filter size={16} /> Filters {hasActiveFilters && "• Active"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {/* Desktop Sticky Filter Sidebar */}
        <aside className="hidden md:block sticky top-24 h-max rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {filterContent}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-sm md:hidden">
            <div className="ml-auto h-full w-4/5 max-w-xs bg-white p-6 shadow-2xl overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-sm font-bold text-slate-900">Filter Products</h2>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        )}

        {/* Main Product Grid Catalog */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center text-slate-500 shadow-sm space-y-3">
              <p className="text-base font-bold text-slate-800">No matching products found</p>
              <p className="text-xs text-slate-500">Try clearing filters or searching for another term.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-block rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {paginatedProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}
