import prisma from "@/lib/prisma";

import { BrandFormData } from "../validation/brand.schema";

export class BrandService {
  static async getAll() {
    return prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  static async getById(id: string) {
    return prisma.brand.findUnique({
      where: {
        id,
      },
    });
  }

  static async create(
    data: BrandFormData
  ) {
    const exists =
      await prisma.brand.findFirst({
        where: {
          OR: [
            {
              name: data.name,
            },
            {
              slug: data.slug,
            },
          ],
        },
      });

    if (exists) {
      throw new Error(
        "Brand already exists."
      );
    }

    return prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo || null,
        description:
          data.description || null,
        isActive:
          data.isActive,
      },
    });
  }

  static async update(
    id: string,
    data: BrandFormData
  ) {
    const exists =
      await prisma.brand.findFirst({
        where: {
          id: {
            not: id,
          },
          OR: [
            {
              name: data.name,
            },
            {
              slug: data.slug,
            },
          ],
        },
      });

    if (exists) {
      throw new Error(
        "Brand already exists."
      );
    }

    return prisma.brand.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo || null,
        description:
          data.description || null,
        isActive:
          data.isActive,
      },
    });
  }

  static async delete(
    id: string
  ) {
    return prisma.brand.delete({
      where: {
        id,
      },
    });
  }
}