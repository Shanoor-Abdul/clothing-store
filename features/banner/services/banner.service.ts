import prisma from "@/lib/prisma";
import { BannerFormData } from "../validation/banner.schema";

export class BannerService {
  static async getAll() {
    return prisma.banner.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  static async getActive() {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }],
    });
  }

  static async getById(id: string) {
    return prisma.banner.findUnique({ where: { id } });
  }

  static async create(data: BannerFormData) {
    return prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle?.trim() || null,
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl,
        buttonText: data.buttonText?.trim() || null,
        redirectUrl: data.redirectUrl?.trim() || null,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
    });
  }

  static async update(id: string, data: BannerFormData) {
    return prisma.banner.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle?.trim() || null,
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl,
        buttonText: data.buttonText?.trim() || null,
        redirectUrl: data.redirectUrl?.trim() || null,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      },
    });
  }

  static async delete(id: string) {
    return prisma.banner.delete({ where: { id } });
  }
}
