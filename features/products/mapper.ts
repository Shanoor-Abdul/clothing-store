import { ProductFormData, VariantFormItem } from "./validation/product.schema";

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
  subcategoryId: product.subcategoryId ?? null,
  brandId: product.brandId,
  collectionIds: product.collectionIds ?? [],
  material: product.material ?? "",
  weight: product.weight,
  price: Number(product.price),
  discount: product.discount ? Number(product.discount) : undefined,
  sellingPrice: Number(product.sellingPrice),
  isReturnable: product.isReturnable,
  isFeatured: product.isFeatured,
  isActive: product.isActive,
  images: product.images ?? [],
  variants:
    product.variants?.map(
      (v: any): VariantFormItem => ({
        id: v.id,
        colorId: v.colorId ?? null,
        sizeId: v.sizeId ?? null,
        sku: v.sku,
        barcode: v.barcode ?? null,
        stock: Number(v.stock),
        price: v.price ? Number(v.price) : null,
        isActive: v.isActive,
      })
    ) ?? [],
});