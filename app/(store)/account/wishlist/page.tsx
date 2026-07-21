"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Trash2, Heart } from "lucide-react";

import { useAppSelector } from "@/store";
import { useWishlist, useRemoveFromWishlist } from "@/features/wishlist/hooks";
import { formatCurrency } from "@/utils";

const WishlistPage = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  const { data: items = [], isLoading } = useWishlist();
  const removeMutation = useRemoveFromWishlist();

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">My Wishlist</h1>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-white p-10 text-center text-slate-500">
          <Heart className="mx-auto mb-3" size={32} />
          Your wishlist is empty.{" "}
          <Link href="/products" className="text-blue-600">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item: { id: string; product: { id: string; name: string; slug: string; sellingPrice: number | string; images?: { imageUrl: string }[]; imageUrl?: string | null } }) => {
            const product = item.product;
            const image =
              product?.images?.[0]?.imageUrl || product?.imageUrl || null;

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border bg-white p-4"
              >
                {image && (
                  <Image
                    src={image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {product.name}
                  </Link>
                  <p className="font-semibold">
                    {formatCurrency(Number(product.sellingPrice))}
                  </p>
                </div>
                <button
                  onClick={() =>
                    removeMutation.mutate(product.id)
                  }
                  className="rounded p-2 text-red-600 hover:bg-red-50"
                  aria-label="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
