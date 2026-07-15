import { Brand } from "./types/brand";

export const sortBrands = (
  brands: Brand[]
) => {
  return [...brands].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

export const getActiveBrands = (
  brands: Brand[]
) => {
  return brands.filter(
    (brand) => brand.isActive
  );
};

export const getBrandBySlug = (
  brands: Brand[],
  slug: string
) => {
  return brands.find(
    (brand) => brand.slug === slug
  );
};