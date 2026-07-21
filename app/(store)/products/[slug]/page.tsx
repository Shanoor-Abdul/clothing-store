"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { formatCurrency } from "@/utils";
import { useCart } from "@/features/cart/hooks";
import { useAppSelector } from "@/store";
import { useAddToWishlist } from "@/features/wishlist/hooks";
import ProductCard from "../../components/ProductCard";
import {
  Product,
  ProductVariant,
} from "@/features/products/types/product";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const fetchProduct = async (slug: string) => {
  const { data } = await api.get<ApiResponse<
    Product & { relatedProducts?: Product[] }
  >>(`/products/${slug}`);
  return data.data;
};

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug);
  const { add } = useCart();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const addWishlist = useAddToWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariant | null
  >(null);
  const [selectedColorIds, setSelectedColorIds] =
    useState<string[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] =
    useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-slate-500">
        Product not found.
      </div>
    );
  }

  const images = product.images ?? [];
  const image = activeImage || images[0]?.imageUrl;
  const variants = product.variants || [];
  const activeVariants = variants.filter(
    (variant) => variant.isActive
  );

  const availableColors = Array.from(
    new Map(
      activeVariants
        .filter((variant) => variant.color)
        .map((variant) => [variant.color!.id, variant.color!])
    ).values()
  );

  const availableSizes = Array.from(
    new Map(
      activeVariants
        .filter((variant) => variant.size)
        .map((variant) => [variant.size!.id, variant.size!])
    ).values()
  );

  const filteredVariants = activeVariants.filter((variant) => {
    const matchesColor =
      selectedColorIds.length === 0 ||
      (variant.colorId &&
        selectedColorIds.includes(variant.colorId));
    const matchesSize =
      selectedSizeIds.length === 0 ||
      (variant.sizeId &&
        selectedSizeIds.includes(variant.sizeId));
    return matchesColor && matchesSize;
  });

  const currentVariant =
    selectedVariant &&
    filteredVariants.some(
      (variant) => variant.id === selectedVariant.id
    )
      ? selectedVariant
      : filteredVariants[0] || null;

  const totalVariantStock = variants.reduce(
    (sum, variant) => sum + (variant.stock ?? 0),
    0
  );
  const fallbackStock =
    product.isActive && product.status !== "OUT_OF_STOCK" ? 10 : 0;
  const stock = currentVariant
    ? currentVariant.stock
    : totalVariantStock > 0
    ? totalVariantStock
    : fallbackStock;

  const handleAddToCart = () => {
    add({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image,
      price: Number(product.price),
      sellingPrice: Number(product.sellingPrice),
      quantity,
      stock,
      variantId: currentVariant?.id ?? null,
      color: currentVariant?.color?.name ?? null,
      size: currentVariant?.size?.name ?? null,
    });

    toast.success("Added to cart");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                width={700}
                height={700}
                className="h-[500px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[500px] items-center justify-center text-slate-400">
                No Image
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex flex-wrap items-center gap-3">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                    image === img.imageUrl ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.altText || product.name}
                    width={100}
                    height={100}
                    className="h-24 w-24 object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                  {product.category?.name || "Uncategorized"}
                </p>
                <h1 className="mt-2 text-4xl font-semibold text-slate-900">
                  {product.name}
                </h1>
              </div>
              <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
                {product.status === "PUBLISHED" ? "In stock" : "Unavailable"}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900">
                  {formatCurrency(Number(product.sellingPrice))}
                </span>
                {Number(product.discount) > 0 && (
                  <span className="text-base text-slate-400 line-through">
                    {formatCurrency(Number(product.price))}
                  </span>
                )}
              </div>

              <div className="rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                {product.isFeatured ? "Featured" : "Best seller"}
              </div>
            </div>

            {product.shortDescription && (
              <p className="mt-4 text-slate-600">
                {product.shortDescription}
              </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-600">Brand</p>
                {product.brand?.logo ? (
                  <div className="mt-2 mb-3 h-16 w-16 overflow-hidden rounded-xl border bg-white">
                    <Image
                      src={product.brand.logo}
                      alt={product.brand.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : null}
                <p className="text-base text-slate-900">
                  {product.brand?.name || "Unknown"}
                </p>
              </div>
              <div className="rounded-3xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-600">SKU</p>
                <p className="mt-2 text-base text-slate-900">{product.sku}</p>
              </div>
              <div className="rounded-3xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-600">Material</p>
                <p className="mt-2 text-base text-slate-900">
                  {product.material || "Not specified"}
                </p>
              </div>
              <div className="rounded-3xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-600">Weight</p>
                <p className="mt-2 text-base text-slate-900">
                  {product.weight ? `${product.weight} g` : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Buy Now</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose quantity and add this product to your cart.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                Available: {stock || 0}
              </div>
            </div>

            {availableColors.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-slate-700">
                  Available Colors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => {
                    const isSelected = selectedColorIds.includes(
                      color.id
                    );

                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => {
                          setSelectedColorIds((current) =>
                            current.includes(color.id)
                              ? current.filter(
                                  (id) => id !== color.id
                                )
                              : [...current, color.id]
                          );
                        }}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border"
                          style={{
                            backgroundColor:
                              color.hexCode || color.name.toLowerCase(),
                          }}
                        />
                        {color.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-slate-700">
                  Available Sizes
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableSizes.map((size) => (
                    <label
                      key={size.id}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition hover:border-slate-400"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizeIds.includes(size.id)}
                        onChange={() => {
                          setSelectedSizeIds((current) =>
                            current.includes(size.id)
                              ? current.filter(
                                  (id) => id !== size.id
                                )
                              : [...current, size.id]
                          );
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      {size.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {filteredVariants.length > 0 ? (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-slate-700">
                  Matching Variants
                </h3>
                <div className="flex flex-wrap gap-2">
                  {filteredVariants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock === 0}
                      className={`rounded-2xl border px-4 py-2 text-sm transition ${
                        currentVariant?.id === v.id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-700 hover:border-slate-400"
                      } ${v.stock === 0 ? "opacity-40" : ""}`}
                    >
                      {v.color?.name || "Variant"}
                      {v.size?.name ? ` / ${v.size.name}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            ) : variants.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                No variants match the selected colors or sizes.
              </div>
            ) : null}

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="rounded-full bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100"
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>
              <span className="min-w-[2.5rem] text-center text-lg font-semibold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                className="rounded-full bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100"
                disabled={stock === 0}
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart size={18} />
              {stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Please login to save to wishlist");
                  router.push("/login");
                  return;
                }
                addWishlist.mutate(product.id, {
                  onSuccess: () => toast.success("Added to wishlist"),
                });
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Heart size={18} />
              Add to Wishlist
            </button>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Product Details</h3>
            <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="font-semibold text-slate-800">Category</dt>
                <dd className="mt-1">{product.category?.name || "Uncategorized"}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="font-semibold text-slate-800">Brand</dt>
                <dd className="mt-1">{product.brand?.name || "Unknown"}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="font-semibold text-slate-800">Status</dt>
                <dd className="mt-1">{product.status}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="font-semibold text-slate-800">Featured</dt>
                <dd className="mt-1">{product.isFeatured ? "Yes" : "No"}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="font-semibold text-slate-800">Reviews</dt>
                <dd className="mt-1">{product.reviewCount} reviews</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="font-semibold text-slate-800">Active</dt>
                <dd className="mt-1">{product.isActive ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="xl:col-span-2">
          {product.description && (
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">Description</h3>
              <p className="mt-4 whitespace-pre-line text-slate-600">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="xl:col-span-2 mt-6">
            <h2 className="text-xl font-bold text-slate-900">
              More from {product.category?.name || "this category"}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {product.relatedProducts.map((related) => (
                <ProductCard
                  key={related.id}
                  product={related}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
