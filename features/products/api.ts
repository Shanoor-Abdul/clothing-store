import api from "@/lib/axios";

import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "./types/product";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = "/admin/products";

export const getProducts = async (): Promise<Product[]> => {
  const { data } =
    await api.get<ApiResponse<Product[]>>(BASE_URL);

  return data.data;
};

export const getProductById = async (
  id: string
): Promise<Product> => {
  const { data } =
    await api.get<ApiResponse<Product>>(
      `${BASE_URL}/${id}`
    );

  return data.data;
};

export const createProduct = async (
  payload: CreateProductPayload
): Promise<Product> => {
  const { data } =
    await api.post<ApiResponse<Product>>(
      BASE_URL,
      payload
    );

  return data.data;
};

export const updateProduct = async (
  id: string,
  payload: UpdateProductPayload
): Promise<Product> => {
  const { data } =
    await api.put<ApiResponse<Product>>(
      `${BASE_URL}/${id}`,
      payload
    );

  return data.data;
};

export const deleteProduct = async (
  id: string
): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};