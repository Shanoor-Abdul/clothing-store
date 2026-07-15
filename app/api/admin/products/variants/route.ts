import { NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";

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

    const variants =
      await prisma.productVariant.findMany({
        where: {
          productId,
        },
        include: {
          color: true,
          size: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    return ApiResponse.success(variants);
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to fetch product variants"
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const {
      productId,
      colorId,
      sizeId,
      sku,
      barcode,
      stock,
      price,
      isActive,
    } = body;

    const exists =
      await prisma.productVariant.findUnique({
        where: {
          sku,
        },
      });

    if (exists) {
      return ApiResponse.error(
        "SKU already exists",
        400
      );
    }

    const variant =
      await prisma.productVariant.create({
        data: {
          product: {
            connect: {
              id: productId,
            },
          },

          color: colorId
            ? {
                connect: {
                  id: colorId,
                },
              }
            : undefined,

          size: sizeId
            ? {
                connect: {
                  id: sizeId,
                },
              }
            : undefined,

          sku,
          barcode: barcode || null,
          stock,
          price: price || null,
          isActive,
        },
        include: {
          color: true,
          size: true,
        },
      });

    return ApiResponse.success(
      variant,
      "Variant created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to create variant"
    );
  }
}

export async function PUT(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const {
      id,
      colorId,
      sizeId,
      sku,
      barcode,
      stock,
      price,
      isActive,
    } = body;

    const exists =
      await prisma.productVariant.findFirst({
        where: {
          id: {
            not: id,
          },
          sku,
        },
      });

    if (exists) {
      return ApiResponse.error(
        "SKU already exists",
        400
      );
    }

    const variant =
      await prisma.productVariant.update({
        where: {
          id,
        },
        data: {
          color: colorId
            ? {
                connect: {
                  id: colorId,
                },
              }
            : {
                disconnect: true,
              },

          size: sizeId
            ? {
                connect: {
                  id: sizeId,
                },
              }
            : {
                disconnect: true,
              },

          sku,
          barcode: barcode || null,
          stock,
          price: price || null,
          isActive,
        },
        include: {
          color: true,
          size: true,
        },
      });

    return ApiResponse.success(
      variant,
      "Variant updated successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to update variant"
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const id =
      request.nextUrl.searchParams.get("id");

    if (!id) {
      return ApiResponse.error(
        "Variant Id is required",
        400
      );
    }

    await prisma.productVariant.delete({
      where: {
        id,
      },
    });

    return ApiResponse.success(
      null,
      "Variant deleted successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to delete variant"
    );
  }
}