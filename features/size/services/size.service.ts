import prisma from "@/lib/prisma";
import { SizeFormData } from "../validation/size.schema";

export class SizeService {
  static async getAll() {
    return prisma.size.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  static async create(data: SizeFormData) {
    return prisma.size.create({
      data: {
        name: data.name,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
    });
  }

  static async update(id: string, data: SizeFormData) {
    return prisma.size.update({
      where: { id },
      data: {
        name: data.name,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
    });
  }

  static async delete(id: string) {
    return prisma.size.delete({ where: { id } });
  }
}
