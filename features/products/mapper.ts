import { ProductFormData, VariantFormItem } from "./validation/product.schema";

export const mapProductToForm = (
  product: any
): ProductFormData => ({
  name: product.name ?? "",
  slug: product.slug ?? "",
  description: product.description ?? "",
  status: product.status ?? "PUBLISHED",
  sku: product.sku ?? "",
  categoryId: product.categoryId ?? "",
  subcategoryId: product.subcategoryId ?? "",
  brandId: product.brandId ?? "",
  collectionIds:
    product.collections?.map(
      (c: any) => c.collectionId ?? c.collection?.id ?? c.id
    ) ?? [],
  material: product.material ?? "",
  price: Number(product.price ?? 0),
  discount: product.discount ? Number(product.discount) : undefined,
  sellingPrice: Number(product.sellingPrice ?? 0),
  isReturnable: product.isReturnable ?? true,
  isFeatured: product.isFeatured ?? false,
  isActive: product.isActive ?? true,
  images:
    product.images?.map((img: any) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      altText: img.altText ?? "",
      displayOrder: img.displayOrder ?? 0,
    })) ?? [],
  videos:
    product.videos?.map((vid: any) => ({
      id: vid.id,
      videoUrl: vid.videoUrl,
      thumbnailUrl: vid.thumbnailUrl ?? "",
      duration: vid.duration ?? null,
    })) ?? [],
  variants:
    product.variants?.map(
      (v: any): VariantFormItem => ({
        id: v.id,
        colorId: v.colorId ?? null,
        sizeId: v.sizeId ?? null,
        sku: v.sku,
        barcode: v.barcode ?? null,
        stock: Number(v.stock ?? 0),
        price: v.price ? Number(v.price) : null,
        isActive: v.isActive ?? true,
      })
    ) ?? [],
});