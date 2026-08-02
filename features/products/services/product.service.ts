import prisma from "@/lib/prisma";
import { ProductFormData } from "../validation/product.schema";

const productIncludeConfig = {
  category: true,
  subcategory: true,
  brand: true,
  images: {
    orderBy: {
      displayOrder: "asc" as const,
    },
  },
  videos: true,
  variants: {
    include: {
      color: true,
      size: true,
    },
  },
  collections: {
    include: {
      collection: true,
    },
  },
};

export class ProductService {
  static async getAll() {
    return prisma.product.findMany({
      include: productIncludeConfig,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getPublishedProducts() {
    return prisma.product.findMany({
      where: {
        isActive: true,
        status: "PUBLISHED",
      },
      include: productIncludeConfig,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getById(id: string) {
    return prisma.product.findUnique({
      where: {
        id,
      },
      include: productIncludeConfig,
    });
  }

  static async create(data: ProductFormData) {
    const exists = await prisma.product.findFirst({
      where: {
        OR: [{ sku: data.sku }, { slug: data.slug }],
      },
    });

    if (exists) {
      throw new Error("Product with this SKU or Slug already exists.");
    }

    const formattedImages: { imageUrl: string; altText: string; displayOrder: number }[] = [];
    if (data.images && data.images.length > 0) {
      data.images.forEach((img: any, idx: number) => {
        const url = typeof img === "string" ? img : img?.imageUrl;
        if (url) {
          formattedImages.push({
            imageUrl: url,
            altText: typeof img === "object" && img?.altText ? img.altText : `${data.name}-${idx + 1}`,
            displayOrder: typeof img === "object" && typeof img?.displayOrder === "number" ? img.displayOrder : idx + 1,
          });
        }
      });
    }

    const formattedVariants: { sku: string; stock: number; barcode: string | null; price: number | null; isActive: boolean; colorId: string | null; sizeId: string | null }[] = [];
    if (data.variants && data.variants.length > 0) {
      data.variants.forEach((v: any) => {
        if (v.sku) {
          formattedVariants.push({
            sku: v.sku,
            stock: Number(v.stock || 0),
            barcode: v.barcode || null,
            price: v.price ? Number(v.price) : null,
            isActive: v.isActive ?? true,
            colorId: v.colorId || null,
            sizeId: v.sizeId || null,
          });
        }
      });
    }

    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        description: data.description,
        price: data.price,
        discount: data.discount || null,
        sellingPrice: data.sellingPrice,
        material: data.material || null,
        status: data.status,
        isReturnable: data.isReturnable ?? true,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        category: {
          connect: {
            id: data.categoryId,
          },
        },
        subcategory: data.subcategoryId
          ? {
              connect: {
                id: data.subcategoryId,
              },
            }
          : undefined,
        brand: data.brandId
          ? {
              connect: {
                id: data.brandId,
              },
            }
          : undefined,
        images:
          formattedImages.length > 0
            ? {
                create: formattedImages,
              }
            : undefined,
        variants:
          formattedVariants.length > 0
            ? {
                create: formattedVariants,
              }
            : undefined,
        collections: {
          create:
            data.collectionIds?.map((collectionId) => ({
              collection: {
                connect: {
                  id: collectionId,
                },
              },
            })) ?? [],
        },
      },
      include: productIncludeConfig,
    });
  }

  static async update(id: string, data: ProductFormData) {
    const exists = await prisma.product.findFirst({
      where: {
        id: {
          not: id,
        },
        OR: [{ sku: data.sku }, { slug: data.slug }],
      },
    });

    if (exists) {
      throw new Error("Product with this SKU or Slug already exists.");
    }

    await prisma.productCollection.deleteMany({
      where: {
        productId: id,
      },
    });

    await prisma.productImage.deleteMany({
      where: {
        productId: id,
      },
    });

    await prisma.productVariant.deleteMany({
      where: {
        productId: id,
      },
    });

    const formattedImages: { imageUrl: string; altText: string; displayOrder: number }[] = [];
    if (data.images && data.images.length > 0) {
      data.images.forEach((img: any, idx: number) => {
        const url = typeof img === "string" ? img : img?.imageUrl;
        if (url) {
          formattedImages.push({
            imageUrl: url,
            altText: typeof img === "object" && img?.altText ? img.altText : `${data.name}-${idx + 1}`,
            displayOrder: typeof img === "object" && typeof img?.displayOrder === "number" ? img.displayOrder : idx + 1,
          });
        }
      });
    }

    const formattedVariants: { sku: string; stock: number; barcode: string | null; price: number | null; isActive: boolean; colorId: string | null; sizeId: string | null }[] = [];
    if (data.variants && data.variants.length > 0) {
      data.variants.forEach((v: any) => {
        if (v.sku) {
          formattedVariants.push({
            sku: v.sku,
            stock: Number(v.stock || 0),
            barcode: v.barcode || null,
            price: v.price ? Number(v.price) : null,
            isActive: v.isActive ?? true,
            colorId: v.colorId || null,
            sizeId: v.sizeId || null,
          });
        }
      });
    }

    return prisma.product.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        description: data.description,
        price: data.price,
        discount: data.discount || null,
        sellingPrice: data.sellingPrice,
        material: data.material || null,
        status: data.status,
        isReturnable: data.isReturnable ?? true,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        category: {
          connect: {
            id: data.categoryId,
          },
        },
        subcategory: data.subcategoryId
          ? {
              connect: {
                id: data.subcategoryId,
              },
            }
          : {
              disconnect: true,
            },
        brand: data.brandId
          ? {
              connect: {
                id: data.brandId,
              },
            }
          : {
              disconnect: true,
            },
        images:
          formattedImages.length > 0
            ? {
                create: formattedImages,
              }
            : undefined,
        variants:
          formattedVariants.length > 0
            ? {
                create: formattedVariants,
              }
            : undefined,
        collections: {
          create:
            data.collectionIds?.map((collectionId) => ({
              collection: {
                connect: {
                  id: collectionId,
                },
              },
            })) ?? [],
        },
      },
      include: productIncludeConfig,
    });
  }

  static async delete(id: string) {
    return prisma.product.delete({
      where: {
        id,
      },
    });
  }
}