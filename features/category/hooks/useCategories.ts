"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../api";

import {
  CATEGORY_MESSAGES,
  CATEGORY_QUERY_KEY,
} from "../constants/category";

import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category";

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: CATEGORY_QUERY_KEY,
    queryFn: getCategories,
  });
};

export const useCategory = (id: string) => {
  return useQuery<Category>({
    queryKey: [...CATEGORY_QUERY_KEY, id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      createCategory(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEY,
      });
    },

    onError: (error) => {
      console.error(CATEGORY_MESSAGES.CREATE_ERROR, error);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryPayload;
    }) => updateCategory(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEY,
      });
    },

    onError: (error) => {
      console.error(CATEGORY_MESSAGES.UPDATE_ERROR, error);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEY,
      });
    },

    onError: (error) => {
      console.error(CATEGORY_MESSAGES.DELETE_ERROR, error);
    },
  });
};