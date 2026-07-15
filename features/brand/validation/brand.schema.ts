import { z } from "zod";

export const BrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Brand name is required"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required"),

  logo: z.string().optional(),

  description: z.string().optional(),

  isActive: z.boolean(),
});

export interface BrandFormData {
  name: string;
  slug: string;

  logo?: string;

  description?: string;

  isActive: boolean;
}