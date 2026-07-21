"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";

import api from "@/lib/axios";
import { useCart } from "@/features/cart/hooks";
import ProductCard from "./components/ProductCard";

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
  images?: { imageUrl: string }[];
  variants?: ProductVariant[];
  categoryId: string;
  category?: { id: string } | null;
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

const HomePage = () => {
  const { add } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>("");

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products", "home"],
    queryFn: () => fetchProducts("/products"),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories", "home"],
    queryFn: fetchCategories,
  });

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories]
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

  const hero = banners[0];

  const handleAddToCart = (product: Product) => {
    const stock =
      product.variants?.reduce(
        (sum: number, variant: ProductVariant) => sum + (variant.stock ?? 0),
        0
      ) ?? 0;

    add({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0]?.imageUrl ?? null,
      price: Number(product.price),
      sellingPrice: Number(product.sellingPrice),
      quantity: 1,
      stock,
      variantId: product.variants?.[0]?.id ?? null,
      color: product.variants?.[0]?.color?.name ?? null,
      size: product.variants?.[0]?.size?.name ?? null,
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-blue-950 px-8 py-10 text-white shadow-lg shadow-blue-100/10 sm:px-12 sm:py-14">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex rounded-full bg-blue-600 px-4 py-1 text-xs uppercase tracking-[0.25em] text-slate-100">
              New arrivals
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Elevate your everyday style with modern clothing essentials.
            </h1>
            <p className="max-w-xl text-sm text-slate-200 sm:text-base">
              Discover handpicked outfits, fresh drops, and effortless looks built to keep your closet feeling new.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-950 transition hover:bg-slate-100"
              >
                Browse Collection
              </Link>
              <Link
                href="/products?featured=true"
                className="inline-flex items-center justify-center rounded-full border border-blue-300 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600/80"
              >
                Shop Featured
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <p className="text-sm text-slate-300">Fast shipping</p>
                <p className="mt-2 text-xl font-semibold">Delivered in 3–5 days</p>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <p className="text-sm text-slate-300">Satisfaction</p>
                <p className="mt-2 text-xl font-semibold">Easy returns within 30 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {activeCategories.slice(0, 4).map((category: Category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-500">
                  No Image
                </div>
              )}
              <div className="space-y-1 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Shop
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {category.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {hero && (
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-lg shadow-slate-900/20">
          <div className="relative min-h-[300px] sm:min-h-[360px]">
            <img
              src={hero.imageUrl}
              alt={hero.title}
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-slate-950/60 p-8 sm:p-12">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
                  {hero.subtitle || "Limited edit"}
                </span>
                <h2 className="text-3xl font-bold sm:text-5xl">
                  {hero.title}
                </h2>
                <p className="max-w-xl text-sm text-slate-200 sm:text-base">
                  {hero.description || "Shop our latest launch with bold styles and premium comfort."}
                </p>
                {hero.buttonText && (
                  <Link
                    href={hero.redirectUrl || "/products"}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    {hero.buttonText}
                    <ShoppingCart size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Discover products</h2>
            <p className="mt-2 text-sm text-slate-500">
              Click a category to refine the selection or add favorites to the cart instantly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("")}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                !activeCategory
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              All
            </button>
            {activeCategories.slice(0, 6).map((category: Category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border bg-white p-10 text-center text-slate-500">
            Loading products...
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="rounded-3xl border bg-white p-10 text-center text-slate-500">
            No products found for this category.
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

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured picks</h2>
            <p className="mt-2 text-sm text-slate-500">
              The most-loved items from our collection, ready to add to your cart.
            </p>
          </div>
          <Link
            href="/products?featured=true"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            Browse featured <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(featuredProducts.length > 0 ? featuredProducts : products)
            .slice(0, 8)
            .map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                actionLabel="Add to cart"
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-lg shadow-slate-900/10 sm:px-12 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold">Refresh your wardrobe effortlessly</h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Enjoy curated styles, quick shipping, and a shopping experience made for modern wardrobes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/products"
              className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Shop all products
            </Link>
            <Link
              href="/products?featured=true"
              className="rounded-full border border-slate-700 bg-transparent px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See featured picks
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
