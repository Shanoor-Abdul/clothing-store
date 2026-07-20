import api from "@/lib/axios";

import {
  Collection,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from "./types/collection";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = "/admin/collections";

export const getCollections = async (): Promise<Collection[]> => {
  const { data } = await api.get<ApiResponse<Collection[]>>(BASE_URL);
  return data.data;
};

export const getCollectionById = async (
  id: string
): Promise<Collection> => {
  const { data } = await api.get<ApiResponse<Collection>>(
    `${BASE_URL}/${id}`
  );
  return data.data;
};

export const createCollection = async (
  payload: CreateCollectionPayload
): Promise<Collection> => {
  const { data } = await api.post<ApiResponse<Collection>>(
    BASE_URL,
    payload
  );
  return data.data;
};

export const updateCollection = async (
  id: string,
  payload: UpdateCollectionPayload
): Promise<Collection> => {
  const { data } = await api.put<ApiResponse<Collection>>(
    `${BASE_URL}/${id}`,
    payload
  );
  return data.data;
};

export const deleteCollection = async (
  id: string
): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};
