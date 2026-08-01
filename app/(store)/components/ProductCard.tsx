import Link from "next/link";
import Image from "next/image";

import { formatCurrency } from "@/utils";
import WishlistButton from "@/components/common/WishlistButton";

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
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
      <div className="absolute right-3 top-3 z-10">
        <WishlistButton productId={product.id} size={18} />
      </div>

      <Link href={`/products/${product.slug}`} className="space-y-3 block">
        {/* Product Image Container with Centered Object-Contain */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 p-2 flex items-center justify-center border border-slate-100">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">
              No Image
            </div>
          )}
          {Number(product.discount) > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              -${product.discount}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="line-clamp-2 text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-black text-slate-900">
              {formatCurrency(Number(product.sellingPrice))}
            </span>
            {Number(product.discount) > 0 && (
              <span className="text-xs text-slate-400 line-through">
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
          className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
          disabled={stock === 0}
        >
          {stock === 0 ? "Out of stock" : actionLabel}
        </button>
      )}
    </div>
  );
};

export default ProductCard;
