import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        isActive: true,
        status: "PUBLISHED",
      },
      include: {
        category: true,
        subcategory: {
          select: {
            id: true,
            name: true,
          },
        },
        brand: true,
        images: {
          orderBy: { displayOrder: "asc" },
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
    });

    if (!product) {
      return ApiResponse.error("Product not found", 404);
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
        status: "PUBLISHED",
      },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
          take: 1,
        },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    const response = {
      ...product,
      relatedProducts,
    };

    return ApiResponse.success(response, "Product fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch product", 500);
  }
}