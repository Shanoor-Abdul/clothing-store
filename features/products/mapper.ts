import { ProductFormData } from "./validation/product.schema";

export const mapProductToForm = (
  product: any
): ProductFormData => ({
  name: product.name,
  slug: product.slug,
  description: product.description ?? "",
  status: product.status,
  sku: product.sku,
  shortDescription: product.shortDescription ?? "",
  categoryId: product.categoryId,
  brandId: product.brandId,
  collectionIds: product.collectionIds ?? [],
  material: product.material ?? "",
  weight: product.weight,
  price: product.price,
  discount: product.discount,
  sellingPrice: product.sellingPrice,
  isReturnable: product.isReturnable,
  isFeatured: product.isFeatured,
  isActive: product.isActive,
});