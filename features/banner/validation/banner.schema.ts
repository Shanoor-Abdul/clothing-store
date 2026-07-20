import { z } from "zod";

export const BannerSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().trim().min(1, "Image URL is required"),
  buttonText: z.string().optional(),
  redirectUrl: z.string().optional(),
  displayOrder: z.coerce.number(),
  isActive: z.boolean(),
});

export interface BannerFormData {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  redirectUrl?: string;
  displayOrder: number;
  isActive: boolean;
}
