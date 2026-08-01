export interface Option {
  id: string;
  name: string;
}

export interface Product {
  id: string;

  name: string;
  slug: string;
  sku: string;

  description: string;
  shortDescription?: string | null;

  price: number;
  discount?: number | null;
  sellingPrice: number;

  weight?: number | null;
  material?: string | null;

  isReturnable: boolean;
  isFeatured: boolean;
  isActive: boolean;

  averageRating?: number | null;
  reviewCount: number;

  status: ProductStatus;

  categoryId: string;
  subcategoryId?: string | null;
  brandId?: string | null;

  createdAt: string;
  updatedAt: string;

  category?: {
    id: string;
    name: string;
  };

  subcategory?: {
    id: string;
    name: string;
  };

  brand?: {
    id: string;
    name: string;
    logo?: string | null;
  };

  imageUrl?: string | null;
  images?: ProductImage[];

  videos?: ProductVideo[];

  variants?: ProductVariant[];

  collections?: ProductCollection[];
}

export type ProductStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "OUT_OF_STOCK"
  | "ARCHIVED";

export interface ProductImage {
  id: string;

  imageUrl: string;

  altText?: string | null;

  displayOrder: number;
}

export interface ProductVideo {
  id: string;

  videoUrl: string;

  thumbnailUrl?: string | null;

  duration?: number | null;
}

export interface ProductVariant {
  id: string;

  sku: string;

  stock: number;

  barcode?: string | null;

  price?: number | null;

  isActive: boolean;

  colorId?: string | null;

  sizeId?: string | null;

  color?: {
    id: string;
    name: string;
    hexCode: string;
  };

  size?: {
    id: string;
    name: string;
  };
}

export interface ProductCollection {
  id: string;

  collectionId: string;

  collection: {
    id: string;
    name: string;
  };
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  sku: string;

  description: string;
  shortDescription?: string;

  price: number;
  discount?: number;
  sellingPrice: number;

  weight?: number;
  material?: string;

  status: ProductStatus;

  isReturnable: boolean;
  isFeatured: boolean;
  isActive: boolean;

  categoryId: string;
  subcategoryId?: string | null;
  brandId?: string;

  collectionIds?: string[];
}

export type UpdateProductPayload =
  Partial<CreateProductPayload>;