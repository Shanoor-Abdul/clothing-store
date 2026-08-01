"use client";

import { Heart } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

import { useAppSelector } from "@/store";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "@/features/wishlist/hooks";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
}

const WishlistButton = ({
  productId,
  className,
  size = 20,
}: WishlistButtonProps) => {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const { data: wishlist = [] } = useWishlist();
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const isInWishlist = wishlist.some(
    (item: { productId: string; product?: { id: string } }) =>
      item.productId === productId || item.product?.id === productId
  );

  const handleToggle = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your wishlist");
      return;
    }

    if (isInWishlist) {
      removeMutation.mutate(productId, {
        onSuccess: () => toast.success("Removed from wishlist"),
      });
    } else {
      addMutation.mutate(productId, {
        onSuccess: () => toast.success("Added to wishlist"),
      });
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={addMutation.isPending || removeMutation.isPending}
      className={clsx(
        "inline-flex items-center justify-center rounded-full p-2 transition-all duration-200",
        isInWishlist
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-slate-400 hover:bg-white hover:text-red-400",
        className
      )}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={size}
        className={clsx(
          "transition-all duration-200",
          isInWishlist && "fill-red-500"
        )}
      />
    </button>
  );
};

export default WishlistButton;