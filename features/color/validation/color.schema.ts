import { z } from "zod";

export const ColorSchema = z.object({
  name: z.string().trim().min(2, "Color name is required"),
  hexCode: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "Enter a valid hex color"),
  isActive: z.boolean(),
});

export interface ColorFormData {
  name: string;
  hexCode: string;
  isActive: boolean;
}
