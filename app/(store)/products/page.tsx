"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import api from "@/lib/axios";
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

const ProductsPageInner = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (search) query.set("search", search);
  if (featured) query.set("featured", featured);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "list", query.toString()],
    queryFn: () => fetchProducts(`/products?${query.toString()}`),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: fetchCategories,
  });

  const title = search
    ? `Search: "${search}"`
    : featured
    ? "Featured Products"
    : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>

      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="space-y-2">
          <Link
            href="/products"
            className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-white"
          >
            All Products
          </Link>
          {categories
            .filter((c: any) => c.isActive)
            .map((c: any) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-white"
              >
                {c.name}
              </Link>
            ))}
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
