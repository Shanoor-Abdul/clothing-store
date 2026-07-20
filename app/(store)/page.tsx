"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

  const { data: featured = [] } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => fetchProducts("/products?featured=true"),
  });

  const { data: latest = [] } = useQuery({
    queryKey: ["products", "latest"],
    queryFn: () => fetchProducts("/products"),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "home"],
    queryFn: fetchCategories,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl bg-slate-900 text-white">
        {banners[0] ? (
          <div className="relative">
            <img
              src={banners[0].imageUrl}
              alt={banners[0].title}
              className="h-72 w-full object-cover opacity-70 md:h-96"
            />
            <div className="absolute inset-0 flex flex-col justify-center px-8">
              <h1 className="text-3xl font-bold md:text-5xl">
                {banners[0].title}
              </h1>
              {banners[0].subtitle && (
                <p className="mt-2 text-lg text-slate-200">
                  {banners[0].subtitle}
                </p>
              )}
              {banners[0].buttonText && (
                <Link
                  href={banners[0].redirectUrl || "/products"}
                  className="mt-6 w-fit rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700"
                >
                  {banners[0].buttonText}
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-72 flex-col justify-center px-8 md:h-96">
            <h1 className="text-3xl font-bold md:text-5xl">
              New Season Collection
            </h1>
            <p className="mt-2 text-lg text-slate-200">
              Discover the latest trends in fashion.
            </p>
            <Link
              href="/products"
              className="mt-6 w-fit rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700"
            >
              Shop Now
            </Link>
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                      className="mx-auto mb-2 h-20 w-full rounded-lg object-cover"
                    />
                  )}
                  <span className="font-medium">
                    {category.name}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link
            href="/products?featured=true"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {featured.slice(0, 10).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Latest */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {latest.slice(0, 10).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
