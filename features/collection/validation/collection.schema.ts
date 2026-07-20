import { z } from "zod";

export const CollectionSchema = z.object({
  name: z.string().trim().min(2, "Collection name is required"),
  slug: z.string().trim().min(2, "Slug is required"),
  image: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.coerce.number(),
  isActive: z.boolean(),
});

export interface CollectionFormData {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}
