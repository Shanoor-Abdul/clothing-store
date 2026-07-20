import api from "@/lib/axios";

import {
  Size,
  CreateSizePayload,
  UpdateSizePayload,
} from "./types/size";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = "/admin/sizes";

export const getSizes = async (): Promise<Size[]> => {
  const { data } = await api.get<ApiResponse<Size[]>>(BASE_URL);
  return data.data;
};

export const createSize = async (
  payload: CreateSizePayload
): Promise<Size> => {
  const { data } = await api.post<ApiResponse<Size>>(
    BASE_URL,
    payload
  );
  return data.data;
};

export const updateSize = async (
  id: string,
  payload: UpdateSizePayload
): Promise<Size> => {
  const { data } = await api.put<ApiResponse<Size>>(
    `${BASE_URL}/${id}`,
    payload
  );
  return data.data;
};

export const deleteSize = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
