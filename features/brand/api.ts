import api from "@/lib/axios";

import {
  Brand,
  CreateBrandPayload,
  UpdateBrandPayload,
} from "./types/brand";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = "/admin/brands";

export const getBrands = async (): Promise<Brand[]> => {
  const response =
    await api.get<ApiResponse<Brand[]>>(BASE_URL);

  return response.data.data;
};

export const createBrand = async (
  payload: CreateBrandPayload
): Promise<Brand> => {
  const response =
    await api.post<ApiResponse<Brand>>(
      BASE_URL,
      payload
    );

  return response.data.data;
};

export const updateBrand = async (
  id: string,
  payload: UpdateBrandPayload
): Promise<Brand> => {
  const response =
    await api.put<ApiResponse<Brand>>(
      `${BASE_URL}/${id}`,
      payload
    );

  return response.data.data;
};

export const deleteBrand = async (
  id: string
): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};