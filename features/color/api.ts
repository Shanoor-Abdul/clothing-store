import api from "@/lib/axios";

import {
  Color,
  CreateColorPayload,
  UpdateColorPayload,
} from "./types/color";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = "/admin/colors";

export const getColors = async (): Promise<Color[]> => {
  const { data } = await api.get<ApiResponse<Color[]>>(BASE_URL);
  return data.data;
};

export const getColorById = async (id: string): Promise<Color> => {
  const { data } = await api.get<ApiResponse<Color>>(
    `${BASE_URL}/${id}`
  );
  return data.data;
};

export const createColor = async (
  payload: CreateColorPayload
): Promise<Color> => {
  const { data } = await api.post<ApiResponse<Color>>(
    BASE_URL,
    payload
  );
  return data.data;
};

export const updateColor = async (
  id: string,
  payload: UpdateColorPayload
): Promise<Color> => {
  const { data } = await api.put<ApiResponse<Color>>(
    `${BASE_URL}/${id}`,
    payload
  );
  return data.data;
};

export const deleteColor = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
