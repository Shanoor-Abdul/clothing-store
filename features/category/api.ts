import api from "@/lib/axios";
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./types/category";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

const BASE_URL = "/admin/categories";

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<ApiResponse<Category[]>>(BASE_URL);

  return data.data;
};

export const getCategoryById = async (
  id: string
): Promise<Category> => {
  const { data } = await api.get<ApiResponse<Category>>(
    `${BASE_URL}/${id}`
  );

  return data.data;
};

export const createCategory = async (
  payload: CreateCategoryPayload
): Promise<Category> => {
  const { data } = await api.post<ApiResponse<Category>>(
    BASE_URL,
    payload
  );

  return data.data;
};

export const updateCategory = async (
  id: string,
  payload: UpdateCategoryPayload
): Promise<Category> => {
  const { data } = await api.put<ApiResponse<Category>>(
    `${BASE_URL}/${id}`,
    payload
  );

  return data.data;
};

export const deleteCategory = async (
  id: string
): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};