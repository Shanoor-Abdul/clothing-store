import prisma from "@/lib/prisma";
import { CategoryFormData } from "../validation/category.schema";

export class CategoryService {
  static async getAll() {
    return prisma.category.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          displayOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    });
  }

  static async getById(id: string) {
    return prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  static async create(data: CategoryFormData) {
    const categoryExists = await prisma.category.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug: data.slug },
        ],
      },
    });

    if (categoryExists) {
      throw new Error("Category already exists.");
    }

    return prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image?.trim() || null,
        icon: data.icon?.trim() || null,
        description: data.description?.trim() || null,
        parentId: data.parentId?.trim() || null,
        displayOrder: data.displayOrder,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      },
    });
  }

  static async update(
    id: string,
    data: CategoryFormData
  ) {
    const categoryExists = await prisma.category.findFirst({
      where: {
        id: {
          not: id,
        },
        OR: [
          { name: data.name },
          { slug: data.slug },
        ],
      },
    });

    if (categoryExists) {
      throw new Error("Category already exists.");
    }

    return prisma.category.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image?.trim() || null,
        icon: data.icon?.trim() || null,
        description: data.description?.trim() || null,
        parentId: data.parentId?.trim() || null,
        displayOrder: data.displayOrder,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      },
    });
  }

  static async delete(id: string) {
    return prisma.category.delete({
      where: {
        id,
      },
    });
  }
}