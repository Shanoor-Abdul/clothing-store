import { z } from "zod";

export const ProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name is required"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required"),

  sku: z
    .string()
    .trim()
    .min(2, "SKU is required"),

  description: z
    .string()
    .trim()
    .min(5, "Description is required"),

  shortDescription: z
    .string()
    .optional(),

  categoryId: z
    .string()
    .min(1, "Category is required"),

  brandId: z
    .string()
    .optional(),

  collectionIds: z
    .array(z.string())
    .default([]),

  material: z
    .string()
    .optional(),

  weight: z.coerce
    .number()
    .optional(),

  price: z.coerce
    .number()
    .min(0),

  discount: z.coerce
    .number()
    .optional(),

  sellingPrice: z.coerce
    .number()
    .min(0),

  status: z.enum([
    "DRAFT",
    "PUBLISHED",
    "OUT_OF_STOCK",
    "ARCHIVED",
  ]),

  isReturnable: z.boolean(),

  isFeatured: z.boolean(),

  isActive: z.boolean(),
});

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

  status:
    | "DRAFT"
    | "PUBLISHED"
    | "OUT_OF_STOCK"
    | "ARCHIVED";

  isReturnable: boolean;
  isFeatured: boolean;
  isActive: boolean;
}