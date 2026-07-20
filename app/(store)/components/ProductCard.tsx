import Link from "next/link";
import Image from "next/image";

import { formatCurrency } from "@/utils";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    sellingPrice: number;
    price: number;
    discount?: number | null;
    images?: { imageUrl: string }[];
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const image = product.images?.[0]?.imageUrl;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-xl border bg-white p-3 shadow-sm transition hover:shadow-md"
    >
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

      <h3 className="mt-3 line-clamp-2 text-sm font-medium text-slate-800">
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
    </Link>
  );
};

export default ProductCard;
