"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

import api from "@/lib/axios";
import ProductCard from "./components/ProductCard";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const fetchBanners = async () => {
  const { data } = await api.get<ApiResponse<any[]>>("/banners");
  return data.data;
};

const fetchProducts = async (url: string) => {
  const { data } = await api.get<ApiResponse<any[]>>(url);
  return data.data;
};

const fetchCategories = async () => {
  const { data } = await api.get<ApiResponse<any[]>>("/categories");
  return data.data;
};

const HomePage = () => {
  const { data: banners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => fetchProducts("/products"),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "home"],
    queryFn: fetchCategories,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      {/* Hero / Banner */}
      {banners[0] && (
        <section className="overflow-hidden rounded-2xl bg-slate-900 text-white">
          <div className="relative">
            <img
              src={banners[0].imageUrl}
              alt={banners[0].title}
              className="h-72 w-full object-cover md:h-96"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8">
              <h1 className="text-2xl font-bold md:text-4xl">
                {banners[0].title}
              </h1>
              {banners[0].subtitle && (
                <p className="mt-2 text-sm text-slate-200">
                  {banners[0].subtitle}
                </p>
              )}
              {banners[0].buttonText && (
                <Link
                  href={banners[0].redirectUrl || "/products"}
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
                >
                  {banners[0].buttonText}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categories
              .filter((c: any) => c.isActive)
              .map((category: any) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="rounded-xl border bg-white p-4 text-center shadow-sm hover:shadow-md"
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="mx-auto mb-2 h-16 w-full rounded-lg object-cover"
                    />
                  )}
                  <span className="font-medium text-sm">
                    {category.name}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Products</h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
            No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;