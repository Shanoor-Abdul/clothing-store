import { Brand } from "./types/brand";
import { BrandFormData } from "./validation/brand.schema";

export const mapBrandToForm = (
  brand: Brand
): BrandFormData => ({
  name: brand.name,
  slug: brand.slug,
  logo: brand.logo ?? "",
  description: brand.description ?? "",
  isActive: brand.isActive,
});