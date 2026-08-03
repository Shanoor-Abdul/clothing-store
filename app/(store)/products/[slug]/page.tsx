"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Zap, Film } from "lucide-react";
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

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { name: string; profileImage?: string | null };
}

const fetchProduct = async (slug: string) => {
  const { data } = await api.get<ApiResponse<
    Product & { relatedProducts?: Product[] }
  >>(`/products/${slug}`);
  return data.data;
};

const fetchReviews = async (productId: string) => {
  const { data } = await api.get<ApiResponse<Review[]>>(`/products/${productId}/reviews`);
  return data.data;
};

const fetchRelatedProducts = async (categoryId?: string) => {
  if (!categoryId) return [];
  const { data } = await api.get<ApiResponse<Product[]>>(`/products?category=${categoryId}`);
  return data.data || [];
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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: () => fetchReviews(product!.id),
    enabled: !!product?.id,
  });

  const { data: relatedProductsList = [] } = useQuery({
    queryKey: ["related-products", product?.categoryId],
    queryFn: () => fetchRelatedProducts(product?.categoryId),
    enabled: !!product?.categoryId,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-8 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-1/3 rounded bg-slate-200"></div>

        <div className="grid gap-8 md:grid-cols-12">
          {/* Left Column Skeleton */}
          <div className="md:col-span-6 space-y-4">
            <div className="h-[420px] w-full rounded-2xl bg-slate-200"></div>
            <div className="flex gap-2.5 overflow-hidden">
              <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-200"></div>
              <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-200"></div>
              <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-200"></div>
            </div>
            <div className="h-32 w-full rounded-2xl bg-slate-200 mt-4"></div>
          </div>

          {/* Right Column Skeleton */}
          <div className="md:col-span-6 space-y-5">
            <div className="rounded-2xl border bg-white p-6 space-y-4 shadow-sm">
              <div className="h-4 w-24 rounded bg-slate-200"></div>
              <div className="h-8 w-3/4 rounded bg-slate-200"></div>
              <div className="h-6 w-1/2 rounded bg-slate-200 mt-4"></div>
              <div className="h-12 w-full rounded-xl bg-slate-200 mt-6"></div>
              <div className="h-12 w-full rounded-xl bg-slate-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">
        Product not found.
      </div>
    );
  }

  const images = product.images ?? [];
  const videos = product.videos ?? [];
  const image =
    activeImage || images[0]?.imageUrl || product.imageUrl || null;
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

  // Filter variants based on user selection
  const filteredVariants = activeVariants.filter((variant) => {
    const matchesColor = !selectedColorId || variant.colorId === selectedColorId;
    const matchesSize = !selectedSizeId || variant.sizeId === selectedSizeId;
    return matchesColor && matchesSize;
  });

  const currentVariant = selectedVariant || (selectedColorId || selectedSizeId ? filteredVariants[0] : null);

  // Base price vs Variant custom price logic
  const displayPrice = (currentVariant && currentVariant.price)
    ? Number(currentVariant.price)
    : Number(product.sellingPrice);

  const stock = currentVariant ? currentVariant.stock : (product.isActive ? 10 : 0);

  const filteredRelatedProducts = (product.relatedProducts || relatedProductsList)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    add({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image,
      price: Number(product.price),
      sellingPrice: displayPrice,
      quantity,
      stock,
      variantId: currentVariant?.id ?? null,
      color: currentVariant?.color?.name ?? null,
      size: currentVariant?.size?.name ?? null,
    });

    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-8">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden whitespace-nowrap">
        <span className="hover:underline cursor-pointer shrink-0" onClick={() => router.push("/")}>Home</span>
        <span className="shrink-0">/</span>
        <span className="hover:underline cursor-pointer shrink-0" onClick={() => router.push("/products")}>Products</span>
        <span className="shrink-0">/</span>
        <span className="font-semibold text-slate-900 truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout (2-Column Amazon / Nike Style) */}
      <div className="grid gap-8 md:grid-cols-12">
        {/* Left Column: Compact Image & Video Gallery */}
        <div className="md:col-span-6 space-y-4">
          <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center p-3">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-slate-400">
                No Image
              </div>
            )}
            {product.discount && Number(product.discount) > 0 ? (
              <span className="absolute top-3 left-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow">
                Save ${product.discount}
              </span>
            ) : null}
          </div>

          {/* Image & Video Thumbnails Strip */}
          {(images.length > 1 || videos.length > 0) && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-slate-50 p-1 flex items-center justify-center transition ${
                    image === img.imageUrl ? "border-blue-600 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.altText || product.name}
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </button>
              ))}

              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-300 bg-slate-900 p-0.5 shadow-sm"
                >
                  <video src={vid.videoUrl} className="h-full w-full object-cover rounded-lg" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                    <Film size={16} />
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Fabric & Product Specifications Box */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b pb-2">Material & Fabric Specifications</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Material / Fabric</span>
                <span className="font-semibold text-slate-800">{product.material || "Standard Cotton Blend"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Return Eligibility</span>
                <span className="font-semibold text-emerald-600">
                  {product.isReturnable ? "✓ 24-Hour Return Window" : "Final Sale"}
                </span>
              </div>
            </div>
            {product.description && (
              <div className="pt-2 border-t text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Compact Product Buy Box */}
        <div className="md:col-span-6 space-y-5">
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            {/* Brand & Title */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                {product.brand?.name || product.category?.name || "Official Store"}
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{product.name}</h1>
              
              {/* Rating Badge */}
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center text-amber-400 text-xs">
                  {"★".repeat(Math.round(Number(product.averageRating || 5)))}
                  {"☆".repeat(5 - Math.round(Number(product.averageRating || 5)))}
                </div>
                <span className="text-xs font-bold text-slate-700">{Number(product.averageRating || 5).toFixed(1)}</span>
                <span className="text-xs text-slate-400">({product.reviewCount || reviews.length} customer reviews)</span>
              </div>

              <p className="text-[11px] text-slate-500 mt-1 font-mono">SKU: {currentVariant?.sku || product.sku}</p>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 border-y border-slate-100 py-3">
              <span className="text-2xl font-black text-slate-900">
                {formatCurrency(displayPrice)}
              </span>
              {Number(product.discount) > 0 && (
                <span className="text-sm text-slate-400 line-through">
                  {formatCurrency(Number(product.price))}
                </span>
              )}
            </div>

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Select Color: <span className="text-blue-600 font-normal">{availableColors.find(c => c.id === selectedColorId)?.name || "Default"}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedColorId(null); setSelectedVariant(null); }}
                    className={`rounded-lg border px-3 py-1 text-xs font-semibold ${!selectedColorId ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200"}`}
                  >
                    All Colors
                  </button>
                  {availableColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => { setSelectedColorId(color.id); setSelectedVariant(null); }}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                        selectedColorId === color.id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border shadow-sm"
                        style={{ backgroundColor: color.hexCode || color.name.toLowerCase() }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Select Size: <span className="text-blue-600 font-normal">{availableSizes.find(s => s.id === selectedSizeId)?.name || "Default"}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setSelectedSizeId(null); setSelectedVariant(null); }}
                    className={`rounded-lg border px-3 py-1 text-xs font-semibold ${!selectedSizeId ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200"}`}
                  >
                    All Sizes
                  </button>
                  {availableSizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => { setSelectedSizeId(size.id); setSelectedVariant(null); }}
                      className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                        selectedSizeId === size.id
                          ? "border-blue-600 bg-blue-600 text-white shadow"
                          : "border-slate-200 text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {stock > 0 ? `${stock} units available` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stock === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow transition hover:bg-amber-400 disabled:opacity-60"
              >
                <Zap size={18} /> Buy Now
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error("Please sign in to save wishlist");
                    router.push("/login");
                    return;
                  }
                  addWishlist.mutate(product.id, {
                    onSuccess: () => toast.success("Added to wishlist"),
                  });
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Heart size={16} /> Add to Wishlist
              </button>
            </div>

            {/* Product Guarantees */}
            <div className="space-y-2 border-t pt-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-blue-600" />
                <span>Fast shipping available to your location</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>100% Authentic Product Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="text-purple-600" />
                <span>Easy 24-Hour Return Window upon delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amazon-Style Suggested & Related Products Section */}
      {filteredRelatedProducts.length > 0 && (
        <section className="space-y-4 pt-6 border-t">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Customers Also Viewed • Related Apparel Items
            </h2>
            <span
              onClick={() => router.push(`/products?category=${product.categoryId}`)}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              See All →
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {filteredRelatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Showcase */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Reviews & Ratings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Verified purchaser reviews</p>
          </div>
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-amber-900">
            <span className="text-xl font-black">{Number(product.averageRating || 5).toFixed(1)}</span>
            <div>
              <div className="text-amber-400 text-xs">
                {"★".repeat(Math.round(Number(product.averageRating || 5)))}
                {"☆".repeat(5 - Math.round(Number(product.averageRating || 5)))}
              </div>
              <span className="text-[11px] text-amber-800 font-semibold">{reviews.length} reviews</span>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No reviews submitted yet for this product. Delivered order customers can leave reviews under My Orders!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="border-b border-slate-100 pb-3 last:border-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{rev.user?.name || "Customer"}</span>
                  <span className="text-[11px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-amber-400 text-xs">
                  {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                </div>
                {rev.comment && <p className="text-xs text-slate-600 leading-relaxed pt-1">{rev.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
