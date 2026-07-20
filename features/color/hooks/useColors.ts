"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createColor,
  deleteColor,
  getColorById,
  getColors,
  updateColor,
} from "../api";

import {
  COLOR_MESSAGES,
  COLOR_QUERY_KEY,
} from "../constants/color";

import {
  Color,
  CreateColorPayload,
  UpdateColorPayload,
} from "../types/color";

export const useColors = () =>
  useQuery<Color[]>({
    queryKey: COLOR_QUERY_KEY,
    queryFn: getColors,
  });

export const useColor = (id: string) =>
  useQuery<Color>({
    queryKey: [...COLOR_QUERY_KEY, id],
    queryFn: () => getColorById(id),
    enabled: !!id,
  });

export const useCreateColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateColorPayload) =>
      createColor(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: COLOR_QUERY_KEY,
      }),
    onError: (error) =>
      console.error(COLOR_MESSAGES.CREATE_ERROR, error),
  });
};

export const useUpdateColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateColorPayload;
    }) => updateColor(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: COLOR_QUERY_KEY,
      }),
    onError: (error) =>
      console.error(COLOR_MESSAGES.UPDATE_ERROR, error),
  });
};

export const useDeleteColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteColor(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: COLOR_QUERY_KEY,
      }),
    onError: (error) =>
      console.error(COLOR_MESSAGES.DELETE_ERROR, error),
  });
};
