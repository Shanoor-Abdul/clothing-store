"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { formatCurrency } from "@/utils";
import { useCart } from "@/features/cart/hooks";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const fetchProduct = async (slug: string) => {
  const { data } = await api.get<ApiResponse<any>>(
    `/products/${slug}`
  );
  return data.data;
};

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug);
  const { add } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<
    any | null
  >(null);

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

  const image = product.images?.[0]?.imageUrl;
  const variants = product.variants || [];
  const stock = selectedVariant
    ? selectedVariant.stock
    : product.variants?.reduce(
        (s: number, v: any) => s + v.stock,
        0
      ) || 0;

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
      variantId: selectedVariant?.id ?? null,
      color: selectedVariant?.color?.name ?? null,
      size: selectedVariant?.size?.name ?? null,
    });

    toast.success("Added to cart");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border bg-white">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              width={500}
              height={500}
              className="h-[400px] w-full object-cover"
            />
          ) : (
            <div className="flex h-[400px] items-center justify-center text-slate-400">
              No Image
            </div>
          )}

          {product.images?.length > 1 && (
            <div className="flex gap-2 p-3">
              {product.images.map((img: any) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={img.altText || product.name}
                  className="h-20 w-20 rounded border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.brand && (
            <p className="mt-1 text-slate-500">
              {product.brand.name}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(Number(product.sellingPrice))}
            </span>
            {Number(product.discount) > 0 && (
              <span className="text-lg text-slate-400 line-through">
                {formatCurrency(Number(product.price))}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-slate-600">
              {product.shortDescription}
            </p>
          )}

          {variants.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium">
                Select Variant
              </h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock === 0}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      selectedVariant?.id === v.id
                        ? "border-blue-600 bg-blue-50"
                        : "hover:border-blue-400"
                    } ${v.stock === 0 ? "opacity-40" : ""}`}
                  >
                    {v.color?.name}
                    {v.size?.name ? ` / ${v.size.name}` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border">
              <button
                onClick={() =>
                  setQuantity((q) => Math.max(1, q - 1))
                }
                className="p-2"
                aria-label="Decrease"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(stock, q + 1))
                }
                className="p-2"
                disabled={stock === 0}
                aria-label="Increase"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <ShoppingCart size={18} />
              {stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {product.description && (
            <div className="mt-8 border-t pt-6">
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="whitespace-pre-line text-slate-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
