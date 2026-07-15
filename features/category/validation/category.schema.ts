import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  slug: z.string().trim().min(2, "Slug is required"),
  image: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  displayOrder: z.coerce.number(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

export interface CategoryFormData {
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  description?: string;
  parentId?: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}