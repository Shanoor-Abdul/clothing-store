import prisma from "@/lib/prisma";

import { ProductFormData } from "../validation/product.schema";

export class ProductService {
  static async getAll() {
    return prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: {
            displayOrder: "asc",
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
      },
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
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
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
      include: {
        category: true,
        brand: true,
        images: true,
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
      },
    });
  }

  static async create(
    data: ProductFormData
  ) {
    const exists =
      await prisma.product.findFirst({
        where: {
          OR: [
            {
              sku: data.sku,
            },
            {
              slug: data.slug,
            },
          ],
        },
      });

    if (exists) {
      throw new Error(
        "Product already exists."
      );
    }

    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,

        description: data.description,
        shortDescription:
          data.shortDescription || null,

        price: data.price,
        discount:
          data.discount || null,
        sellingPrice:
          data.sellingPrice,

        weight:
          data.weight || null,

        material:
          data.material || null,

        status: data.status,

        isReturnable:
          data.isReturnable,

        isFeatured:
          data.isFeatured,

        isActive:
          data.isActive,

        category: {
          connect: {
            id: data.categoryId,
          },
        },

        brand: data.brandId
          ? {
              connect: {
                id: data.brandId,
              },
            }
          : undefined,

        collections: {
          create:
            data.collectionIds?.map(
              (
                collectionId
              ) => ({
                collection: {
                  connect: {
                    id: collectionId,
                  },
                },
              })
            ) ?? [],
        },
      },
      include: {
        category: true,
        brand: true,
        collections: {
          include: {
            collection: true,
          },
        },
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });
  }

  static async update(
    id: string,
    data: ProductFormData
  ) {
    const exists =
      await prisma.product.findFirst({
        where: {
          id: {
            not: id,
          },
          OR: [
            {
              sku: data.sku,
            },
            {
              slug: data.slug,
            },
          ],
        },
      });

    if (exists) {
      throw new Error(
        "Product already exists."
      );
    }

    await prisma.productImage.deleteMany({
      where: {
        productId: id,
      },
    });

    await prisma.productCollection.deleteMany({
      where: {
        productId: id,
      },
    });

    return prisma.product.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,

        description: data.description,
        shortDescription:
          data.shortDescription || null,

        price: data.price,
        discount:
          data.discount || null,
        sellingPrice:
          data.sellingPrice,

        weight:
          data.weight || null,

        material:
          data.material || null,

        status: data.status,

        isReturnable:
          data.isReturnable,

        isFeatured:
          data.isFeatured,

        isActive:
          data.isActive,

        category: {
          connect: {
            id: data.categoryId,
          },
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

        collections: {
          create:
            data.collectionIds?.map(
              (
                collectionId
              ) => ({
                collection: {
                  connect: {
                    id: collectionId,
                  },
                },
              })
            ) ?? [],
        },
      },
      include: {
        category: true,
        brand: true,
        collections: {
          include: {
            collection: true,
          },
        },
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });
  }

  static async delete(
    id: string
  ) {
    return prisma.product.delete({
      where: {
        id,
      },
    });
  }
}