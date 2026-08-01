export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductVariant {
  id: string;
  stock: number;
  sku: string;
  barcode?: string | null;
  price?: number | string | null;
  isActive: boolean;
  colorId?: string | null;
  color?: { id: string; name: string; hexCode: string } | null;
  sizeId?: string | null;
  size?: { id: string; name: string } | null;
  productId: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string | null;
  displayOrder: number;
  productId: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string | null;
  sku: string;
  price: number | string;
  sellingPrice: number | string;
  discount?: number | null;
  imageUrl?: string | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  categoryId: string;
  category?: { id: string; name: string; slug: string } | null;
  brandId?: string | null;
  brand?: { id: string; name: string } | null;
  isFeatured?: boolean;
  isActive?: boolean;
  status?: string;
  material?: string | null;
  weight?: number | string | null;
  isReturnable?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  redirectUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  icon?: string | null;
  parentId?: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}