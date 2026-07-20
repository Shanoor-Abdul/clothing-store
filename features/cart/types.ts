export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image?: string | null;
  price: number;
  sellingPrice: number;
  quantity: number;
  stock: number;
  variantId?: string | null;
  color?: string | null;
  size?: string | null;
}
