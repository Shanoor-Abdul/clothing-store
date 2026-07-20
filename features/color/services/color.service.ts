import prisma from "@/lib/prisma";
import { ColorFormData } from "../validation/color.schema";

export class ColorService {
  static async getAll() {
    return prisma.color.findMany({
      orderBy: { name: "asc" },
    });
  }

  static async getById(id: string) {
    return prisma.color.findUnique({ where: { id } });
  }

  static async create(data: ColorFormData) {
    const exists = await prisma.color.findFirst({
      where: { name: data.name },
    });

    if (exists) throw new Error("Color already exists.");

    return prisma.color.create({
      data: {
        name: data.name,
        hexCode: data.hexCode,
        isActive: data.isActive,
      },
    });
  }

  static async update(id: string, data: ColorFormData) {
    const exists = await prisma.color.findFirst({
      where: { name: data.name, id: { not: id } },
    });

    if (exists) throw new Error("Color already exists.");

    return prisma.color.update({
      where: { id },
      data: {
        name: data.name,
        hexCode: data.hexCode,
        isActive: data.isActive,
      },
    });
  }

  static async delete(id: string) {
    return prisma.color.delete({ where: { id } });
  }
}
