import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getWishlist = async (): Promise<any[]> => {
  const { data } = await api.get<ApiResponse<any[]>>("/wishlist");
  return data.data;
};

export const addToWishlist = async (
  productId: string
): Promise<void> => {
  await api.post("/wishlist", { productId });
};

export const removeFromWishlist = async (
  productId: string
): Promise<void> => {
  await api.delete(`/wishlist?productId=${productId}`);
};
