import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().trim().min(2, "Product name is required"),
  slug: z.string().trim().min(2, "Slug is required"),
  sku: z.string().trim().min(2, "SKU is required"),
  description: z.string().trim().min(5, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  collectionIds: z.array(z.string()).default([]),
  material: z.string().optional().nullable(),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().optional().nullable(),
  sellingPrice: z.coerce.number().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "OUT_OF_STOCK", "ARCHIVED"]),
  isReturnable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),

  images: z.array(z.object({
    imageUrl: z.string(),
    altText: z.string().optional().nullable(),
    displayOrder: z.number().optional(),
  })).optional().default([]),

  videos: z.array(z.object({
    videoUrl: z.string(),
    thumbnailUrl: z.string().optional().nullable(),
    duration: z.number().optional().nullable(),
  })).optional().default([]),

  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        colorId: z.string().optional().nullable(),
        sizeId: z.string().optional().nullable(),
        sku: z.string().min(1, "SKU is required"),
        barcode: z.string().optional().nullable(),
        stock: z.coerce.number().min(0).default(0),
        price: z.coerce.number().optional().nullable(),
        isActive: z.boolean().default(true),
      })
    )
    .optional()
    .default([]),
});

export interface VariantFormItem {
  id?: string;
  colorId?: string | null;
  sizeId?: string | null;
  sku: string;
  barcode?: string | null;
  stock: number;
  price?: number | null;
  isActive: boolean;
}

export interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  description: string;
  categoryId: string;
  subcategoryId?: string | null;
  brandId?: string | null;
  collectionIds: string[];
  material?: string | null;
  price: number;
  discount?: number | null;
  sellingPrice: number;
  status: "DRAFT" | "PUBLISHED" | "OUT_OF_STOCK" | "ARCHIVED";
  isReturnable: boolean;
  isFeatured: boolean;
  isActive: boolean;
  images: Array<{ imageUrl: string; altText?: string | null; displayOrder?: number }>;
  videos?: Array<{ videoUrl: string; thumbnailUrl?: string | null; duration?: number | null }>;
  variants: VariantFormItem[];
}