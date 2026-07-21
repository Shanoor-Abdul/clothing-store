import api from "@/lib/axios";

import {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductImage,
} from "./types/product";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE_URL = "/admin/products";

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read file"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

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

export const uploadProductImage = async (
  productId: string,
  file: File
): Promise<ProductImage> => {
  const imageUrl = await readFileAsDataUrl(file);

  const { data } = await api.post<
    ApiResponse<ProductImage>
  >("/admin/products/images", {
    productId,
    imageUrl,
    altText: file.name,
    displayOrder: 0,
  });

  return data.data;
};

export const deleteProductImage = async (
  id: string
): Promise<void> => {
  await api.delete(`/admin/products/images?id=${id}`);
};