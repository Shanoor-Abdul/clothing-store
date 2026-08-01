import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().trim().min(2, "Product name is required"),
  slug: z.string().trim().min(2, "Slug is required"),
  sku: z.string().trim().min(2, "SKU is required"),
  description: z.string().trim().min(5, "Description is required"),
  shortDescription: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
  collectionIds: z.array(z.string()).default([]),
  material: z.string().optional(),
  weight: z.coerce.number().optional(),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().optional(),
  sellingPrice: z.coerce.number().min(0),
  status: z.enum(["DRAFT", "PUBLISHED", "OUT_OF_STOCK", "ARCHIVED"]),
  isReturnable: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),

  images: z.array(z.object({
    imageUrl: z.string(),
    altText: z.string().optional(),
    displayOrder: z.number().optional(),
  }).or(z.any())).optional().default([]),

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
  shortDescription?: string;
  categoryId: string;
  brandId?: string;
  collectionIds: string[];
  material?: string;
  weight?: number;
  price: number;
  discount?: number;
  sellingPrice: number;
  status: "DRAFT" | "PUBLISHED" | "OUT_OF_STOCK" | "ARCHIVED";
  isReturnable: boolean;
  isFeatured: boolean;
  isActive: boolean;
  images: Array<{ imageUrl: string; altText?: string; displayOrder?: number } | File>;
  variants: VariantFormItem[];
}