"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "./api";

export const WISHLIST_QUERY_KEY = ["wishlist"];

export const useWishlist = () => {
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: getWishlist,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      addToWishlist(productId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: WISHLIST_QUERY_KEY,
      }),
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      removeFromWishlist(productId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: WISHLIST_QUERY_KEY,
      }),
  });
};
