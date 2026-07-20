import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {
      isActive: true,
      status: "PUBLISHED",
    };

    if (category) {
      where.categoryId = category;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        {
          description: { contains: search, mode: "insensitive" },
        },
        {
          shortDescription: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ApiResponse.success(products, "Products fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch products", 500);
  }
}
