import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireUser() {
  const user = await getCurrentUser();

  if (!user || user.role !== "USER") return null;

  return user;
}

export async function GET() {
  const auth = await requireUser();

  if (!auth) return ApiResponse.error("Unauthorized", 401);

  const items = await prisma.wishlist.findMany({
    where: { userId: auth.id },
    include: {
      product: {
        include: {
          images: { orderBy: { displayOrder: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse.success(items, "Wishlist fetched");
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();

  if (!auth) return ApiResponse.error("Unauthorized", 401);

  try {
    const body = await request.json();
    const productId = String(body.productId ?? "");

    if (!productId) {
      return ApiResponse.error("Product id is required", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return ApiResponse.error("Product not found", 404);
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: auth.id,
          productId,
        },
      },
    });

    if (existing) {
      return ApiResponse.success(existing, "Already in wishlist");
    }

    const item = await prisma.wishlist.create({
      data: { userId: auth.id, productId },
    });

    return ApiResponse.success(item, "Added to wishlist", 201);
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to add to wishlist", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser();

  if (!auth) return ApiResponse.error("Unauthorized", 401);

  try {
    const productId = request.nextUrl.searchParams.get(
      "productId"
    );

    if (!productId) {
      return ApiResponse.error("Product id is required", 400);
    }

    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: auth.id,
          productId,
        },
      },
    });

    if (!item) {
      return ApiResponse.error("Item not found", 404);
    }

    await prisma.wishlist.delete({ where: { id: item.id } });

    return ApiResponse.success(null, "Removed from wishlist");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to remove", 500);
  }
}
