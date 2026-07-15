"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "../api";

import { BrandFormData } from "../validation/brand.schema";

export const BRAND_QUERY_KEY = [
  "brands",
];

export const useBrands = () =>
  useQuery({
    queryKey: BRAND_QUERY_KEY,
    queryFn: getBrands,
  });

export const useCreateBrand = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: createBrand,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BRAND_QUERY_KEY,
      });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: BrandFormData;
    }) =>
      updateBrand(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BRAND_QUERY_KEY,
      });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: deleteBrand,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BRAND_QUERY_KEY,
      });
    },
  });
};