"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Zap } from "lucide-react";
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
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">
        Loading product details...
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

  // Base price vs Variant custom price logic:
  // If user selected a variant with custom price, use variant.price. Otherwise use base product.sellingPrice!
  const displayPrice = (currentVariant && currentVariant.price)
    ? Number(currentVariant.price)
    : Number(product.sellingPrice);

  const stock = currentVariant ? currentVariant.stock : (product.isActive ? 10 : 0);

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
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <nav className="text-xs text-slate-500">
        <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span> /{" "}
        <span className="hover:underline cursor-pointer" onClick={() => router.push("/products")}>Products</span> /{" "}
        <span className="font-semibold text-slate-900">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Image Gallery with Centered Object-Contain */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm flex items-center justify-center p-4">
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
              <span className="absolute top-4 left-4 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow">
                Save ${product.discount}
              </span>
            ) : null}
          </div>

          {/* Image Thumbnails with Centered Container */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-slate-50 p-1 flex items-center justify-center transition ${
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
            </div>
          )}

          {/* Product Description Block */}
          {product.description && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3 mt-6">
              <h2 className="text-lg font-bold text-slate-900">Product Description</h2>
              <p className="whitespace-pre-line text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Product Buy Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
            {/* Header info */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                {product.brand?.name || product.category?.name || "Official Store"}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{product.name}</h1>
              <p className="text-xs text-slate-500 mt-1">SKU: {currentVariant?.sku || product.sku}</p>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 border-y border-slate-100 py-3">
              <span className="text-3xl font-black text-slate-900">
                {formatCurrency(displayPrice)}
              </span>
              {Number(product.discount) > 0 && (
                <span className="text-base text-slate-400 line-through">
                  {formatCurrency(Number(product.price))}
                </span>
              )}
            </div>

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Select Color: <span className="text-blue-600 font-normal">{availableColors.find(c => c.id === selectedColorId)?.name || "Default (Base)"}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedColorId(null); setSelectedVariant(null); }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${!selectedColorId ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200"}`}
                  >
                    All Colors
                  </button>
                  {availableColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => { setSelectedColorId(color.id); setSelectedVariant(null); }}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        selectedColorId === color.id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border shadow-sm"
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Select Size: <span className="text-blue-600 font-normal">{availableSizes.find(s => s.id === selectedSizeId)?.name || "Default (Base)"}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedSizeId(null); setSelectedVariant(null); }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${!selectedSizeId ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200"}`}
                  >
                    All Sizes
                  </button>
                  {availableSizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => { setSelectedSizeId(size.id); setSelectedVariant(null); }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        selectedSizeId === size.id
                          ? "border-blue-600 bg-blue-50 text-blue-700"
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100"
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
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={stock === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow transition hover:bg-amber-400 disabled:opacity-60"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
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
                <span>Easy returns within 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Carousel */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="space-y-4 pt-6 border-t">
          <h2 className="text-xl font-bold text-slate-900">
            More items from {product.category?.name || "this collection"}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {product.relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
