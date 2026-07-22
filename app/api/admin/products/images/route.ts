import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      productId,
      imageUrl,
      altText,
      displayOrder,
    } = body;

    if (!productId || !imageUrl) {
      return ApiResponse.error(
        "Product ID and Image URL are required",
        400
      );
    }

    const image = await prisma.productImage.create({
      data: {
        productId,
        imageUrl,
        altText: altText || null,
        displayOrder: displayOrder || 0,
      },
    });

    return ApiResponse.success(
      image,
      "Product image uploaded successfully",
      201
    );
  } catch (error: any) {
    console.error("Image upload error:", error);
    if (error.code === "P2003") {
      return ApiResponse.error(
        "Product not found or image already exists",
        400
      );
    }
    return ApiResponse.error(
      error.message || "Failed to upload image",
      500
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const productId =
      request.nextUrl.searchParams.get("productId");

    if (!productId) {
      return ApiResponse.error(
        "Product Id is required",
        400
      );
    }

    const images = await prisma.productImage.findMany({
      where: {
        productId,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    return ApiResponse.success(images);
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to fetch images"
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id =
      request.nextUrl.searchParams.get("id");

    if (!id) {
      return ApiResponse.error(
        "Image Id is required",
        400
      );
    }

    await prisma.productImage.delete({
      where: {
        id,
      },
    });

    return ApiResponse.success(
      null,
      "Image deleted successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to delete image"
    );
  }
}