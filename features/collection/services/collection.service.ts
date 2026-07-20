import prisma from "@/lib/prisma";
import { CollectionFormData } from "../validation/collection.schema";

export class CollectionService {
  static async getAll() {
    return prisma.collection.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  static async getById(id: string) {
    return prisma.collection.findUnique({ where: { id } });
  }

  static async create(data: CollectionFormData) {
    const exists = await prisma.collection.findFirst({
      where: { OR: [{ name: data.name }, { slug: data.slug }] },
    });

    if (exists) throw new Error("Collection already exists.");

    return prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image?.trim() || null,
        description: data.description?.trim() || null,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
    });
  }

  static async update(id: string, data: CollectionFormData) {
    const exists = await prisma.collection.findFirst({
      where: { id: { not: id }, OR: [{ name: data.name }, { slug: data.slug }] },
    });

    if (exists) throw new Error("Collection already exists.");

    return prisma.collection.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image?.trim() || null,
        description: data.description?.trim() || null,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
    });
  }

  static async delete(id: string) {
    return prisma.collection.delete({ where: { id } });
  }
}
