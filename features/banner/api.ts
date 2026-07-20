import api from "@/lib/axios";

import {
  Banner,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "./types/banner";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = "/admin/banners";

export const getBanners = async (): Promise<Banner[]> => {
  const { data } = await api.get<ApiResponse<Banner[]>>(BASE_URL);
  return data.data;
};

export const getActiveBanners = async (): Promise<Banner[]> => {
  const { data } = await api.get<ApiResponse<Banner[]>>(
    "/banners"
  );
  return data.data;
};

export const createBanner = async (
  payload: CreateBannerPayload
): Promise<Banner> => {
  const { data } = await api.post<ApiResponse<Banner>>(
    BASE_URL,
    payload
  );
  return data.data;
};

export const updateBanner = async (
  id: string,
  payload: UpdateBannerPayload
): Promise<Banner> => {
  const { data } = await api.put<ApiResponse<Banner>>(
    `${BASE_URL}/${id}`,
    payload
  );
  return data.data;
};

export const deleteBanner = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
