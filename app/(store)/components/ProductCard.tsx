import Link from "next/link";
import Image from "next/image";

import { formatCurrency } from "@/utils";

interface ProductVariant {
  id: string;
  stock: number;
  color?: { name?: string | null } | null;
  size?: { name?: string | null } | null;
}

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    sellingPrice: number | string;
    price: number | string;
    discount?: number | null;
    imageUrl?: string | null;
    images?: { imageUrl: string }[];
    isFeatured?: boolean;
    isActive?: boolean;
    status?: string;
    variants?: ProductVariant[];
  };
  onAddToCart?: () => void;
  actionLabel?: string;
}

const ProductCard = ({
  product,
  onAddToCart,
  actionLabel = "Add",
}: ProductCardProps) => {
  const image = product.images?.[0]?.imageUrl || product.imageUrl || null;
  const variantStock =
    product.variants?.reduce(
      (sum, variant) => sum + (variant.stock ?? 0),
      0
    ) ?? 0;
  const stock =
    variantStock > 0
      ? variantStock
      : product.isActive && product.status !== "OUT_OF_STOCK"
      ? 10
      : 0;

  return (
    <div className="group rounded-xl border bg-white p-3 shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              No Image
            </div>
          )}
        </div>

        <div>
          <h3 className="line-clamp-2 text-sm font-medium text-slate-800">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {formatCurrency(Number(product.sellingPrice))}
            </span>
            {Number(product.discount) > 0 && (
              <span className="text-sm text-slate-400 line-through">
                {formatCurrency(Number(product.price))}
              </span>
            )}
          </div>
        </div>
      </Link>

      {onAddToCart && (
        <button
          type="button"
          onClick={onAddToCart}
          className="mt-4 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          disabled={stock === 0}
        >
          {stock === 0 ? "Out of stock" : actionLabel}
        </button>
      )}
    </div>
  );
};

export default ProductCard;
