"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner,
} from "../api";

import { BANNER_QUERY_KEY } from "../constants/banner";

import {
  Banner,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "../types/banner";

export const useBanners = () =>
  useQuery<Banner[]>({
    queryKey: BANNER_QUERY_KEY,
    queryFn: getBanners,
  });

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBannerPayload) =>
      createBanner(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEY }),
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBannerPayload;
    }) => updateBanner(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEY }),
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEY }),
  });
};
