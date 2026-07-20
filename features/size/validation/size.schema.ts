import { z } from "zod";

export const SizeSchema = z.object({
  name: z.string().trim().min(1, "Size name is required"),
  displayOrder: z.coerce.number(),
  isActive: z.boolean(),
});

export interface SizeFormData {
  name: string;
  displayOrder: number;
  isActive: boolean;
}
