"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createSize,
  deleteSize,
  getSizes,
  updateSize,
} from "../api";

import { SIZE_QUERY_KEY } from "../constants/size";

import {
  Size,
  CreateSizePayload,
  UpdateSizePayload,
} from "../types/size";

export const useSizes = () =>
  useQuery<Size[]>({
    queryKey: SIZE_QUERY_KEY,
    queryFn: getSizes,
  });

export const useCreateSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSizePayload) =>
      createSize(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SIZE_QUERY_KEY }),
  });
};

export const useUpdateSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSizePayload;
    }) => updateSize(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SIZE_QUERY_KEY }),
  });
};

export const useDeleteSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSize(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SIZE_QUERY_KEY }),
  });
};
