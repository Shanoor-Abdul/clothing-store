"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, ShoppingCart, ChevronLeft, ChevronRight, Layers, Tag, ShieldCheck, Truck } from "lucide-react";
import { useMemo, useState, useCallback, useEffect } from "react";

import api from "@/lib/axios";
import { useCart } from "@/features/cart/hooks";
import ProductCard from "./components/ProductCard";
import { ProductCardSkeleton } from "@/components/common/Skeleton";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  redirectUrl?: string | null;
}

interface Category {
  id: string;
  name: string;
  image?: string | null;
  isActive: boolean;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  isActive: boolean;
}

interface ProductVariant {
  id: string;
  stock: number;
  color?: { name?: string | null } | null;
  size?: { name?: string | null } | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  sellingPrice: number | string;
  discount?: number | null;
  imageUrl?: string | null;
  images?: { imageUrl: string }[];
  variants?: ProductVariant[];
  categoryId: string;
  category?: { id: string; name?: string } | null;
  isFeatured?: boolean;
}

const fetchBanners = async (): Promise<Banner[]> => {
  const { data } = await api.get<ApiResponse<Banner[]>>("/banners");
  return data.data;
};

const fetchProducts = async (url: string): Promise<Product[]> => {
  const { data } = await api.get<ApiResponse<Product[]>>(url);
  return data.data;
};

const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<ApiResponse<Category[]>>("/categories");
  return data.data;
};

const fetchCollections = async (): Promise<Collection[]> => {
  const { data } = await api.get<ApiResponse<Collection[]>>("/collections");
  return data.data;
};

const HomePage = () => {
  const { add } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: fetchBanners,
    staleTime: 5 * 60 * 1000,
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products", "home"],
    queryFn: () => fetchProducts("/products"),
    staleTime: 2 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories", "home"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["collections", "home"],
    queryFn: fetchCollections,
    staleTime: 5 * 60 * 1000,
  });

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories]
  );

  const activeCollections = useMemo(
    () => collections.filter((collection) => collection.isActive),
    [collections]
  );

  const featuredProducts = useMemo(
    () => products.filter((product) => Boolean(product.isFeatured)),
    [products]
  );

  const displayedProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter(
      (product) =>
        product.categoryId === activeCategory ||
        product.category?.id === activeCategory
    );
  }, [activeCategory, products]);

  // Banner Carousel Auto-play logic
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleNextBanner = () => {
    if (banners.length === 0) return;
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    if (banners.length === 0) return;
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const activeBanner = banners[currentBannerIndex] || banners[0];

  const handleAddToCart = useCallback(
    (product: Product) => {
      const stock =
        product.variants?.reduce(
          (sum: number, variant: ProductVariant) => sum + (variant.stock ?? 0),
          0
        ) ?? 0;

      add({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.imageUrl || product.imageUrl || null,
        price: Number(product.price),
        sellingPrice: Number(product.sellingPrice),
        quantity: 1,
        stock,
        variantId: product.variants?.[0]?.id ?? null,
        color: product.variants?.[0]?.color?.name ?? null,
        size: product.variants?.[0]?.size?.name ?? null,
      });
    },
    [add]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6">
      {/* 1. Main Hero Banner Carousel */}
      {banners.length > 0 && activeBanner ? (
        <section className="relative h-[280px] sm:h-[340px] md:h-[400px] w-full overflow-hidden rounded-2xl bg-slate-950 text-white shadow-lg">
          <img
            src={activeBanner.imageUrl}
            alt={activeBanner.title}
            className="h-full w-full object-cover opacity-80 transition-opacity duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent p-6 sm:p-12 flex items-center">
            <div className="max-w-xl space-y-3 sm:space-y-4">
              {activeBanner.subtitle && (
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-200 backdrop-blur-sm">
                  {activeBanner.subtitle}
                </span>
              )}
              <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl drop-shadow-md">
                {activeBanner.title}
              </h1>
              {activeBanner.description && (
                <p className="max-w-md text-xs text-slate-200 sm:text-sm line-clamp-2">
                  {activeBanner.description}
                </p>
              )}
              {activeBanner.buttonText && (
                <Link
                  href={activeBanner.redirectUrl || "/products"}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:scale-105 sm:text-sm"
                >
                  {activeBanner.buttonText}
                  <ShoppingCart size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Banner Controls */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevBanner}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur hover:bg-slate-900 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNextBanner}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur hover:bg-slate-900 transition"
              >
                <ChevronRight size={18} />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentBannerIndex === idx
                        ? "w-7 bg-white"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        /* Fallback Hero Banner if no banner is defined */
        <section className="rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 p-8 sm:p-12 text-white shadow-lg">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex rounded-full bg-blue-600 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-slate-100">
              Welcome to ClothingStore
            </span>
            <h1 className="text-3xl font-extrabold sm:text-5xl">
              Elevate Your Everyday Style
            </h1>
            <p className="text-sm text-slate-200">
              Discover handpicked apparel, trendsetting drops, and luxury essentials crafted for your modern closet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Shop All Products <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* 2. Top Trust Highlights Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Fast Shipping</p>
            <p className="text-[11px] text-slate-500">Delivered in 3–5 days</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">100% Quality Guaranteed</p>
            <p className="text-[11px] text-slate-500">Verified products & fabrics</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Tag size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Best Price Offers</p>
            <p className="text-[11px] text-slate-500">Direct deals & discounts</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Easy 30-Day Returns</p>
            <p className="text-[11px] text-slate-500">Hassle-free return policy</p>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category Grid */}
      {activeCategories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Shop by Category</h2>
              <p className="text-xs text-slate-500 sm:text-sm">Explore our top fashion departments</p>
            </div>
            <Link href="/products" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activeCategories.slice(0, 8).map((category: Category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">
                      {category.name}
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {category.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-600">Shop Department &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Featured Collections Showcase Section */}
      {activeCollections.length > 0 && (
        <section className="space-y-4 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Curated Showcases</span>
              <h2 className="text-xl font-bold sm:text-2xl">Featured Collections</h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-sky-400 hover:underline">
              Explore All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {activeCollections.slice(0, 3).map((collection: Collection) => (
              <Link
                key={collection.id}
                href={`/products?collection=${collection.id}`}
                className="group relative h-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow transition hover:border-sky-500/50"
              >
                {collection.image ? (
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-75"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-slate-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-5 flex flex-col justify-end">
                  <span className="inline-block w-max rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    Collection
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-white drop-shadow">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-xs text-slate-300 line-clamp-1">
                      {collection.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. Main Product Discovery Catalog */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Discover Products</h2>
            <p className="text-xs text-slate-500">
              Filter by category or select items to add to cart
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("")}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                !activeCategory
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
              }`}
            >
              All Items
            </button>
            {activeCategories.slice(0, 6).map((category: Category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center text-slate-500 shadow-sm">
            No products found for this section.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {displayedProducts.slice(0, 8).map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                actionLabel="Quick add"
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. Featured Picks Section */}
      {featuredProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Featured Picks</h2>
              <p className="text-xs text-slate-500">Handpicked items selected for you</p>
            </div>
            <Link
              href="/products?featured=true"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              Browse Featured <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.slice(0, 8).map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                actionLabel="Add to cart"
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
