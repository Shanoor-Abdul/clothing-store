"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../api";

import {
  PRODUCT_MESSAGES,
  PRODUCT_QUERY_KEY,
} from "../constants/product";

import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product";

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: PRODUCT_QUERY_KEY,
    queryFn: getProducts,
  });
};

export const useProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: [...PRODUCT_QUERY_KEY, id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      createProduct(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEY,
      });
    },

    onError: (error) => {
      console.error(PRODUCT_MESSAGES.CREATE_ERROR, error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductPayload;
    }) => updateProduct(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEY,
      });
    },

    onError: (error) => {
      console.error(PRODUCT_MESSAGES.UPDATE_ERROR, error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEY,
      });
    },

    onError: (error) => {
      console.error(PRODUCT_MESSAGES.DELETE_ERROR, error);
    },
  });
};