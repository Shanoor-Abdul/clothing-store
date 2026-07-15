import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";

import { ProductService } from "@/features/products/services/product.service";
import { ProductSchema } from "@/features/products/validation/product.schema";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const product = await ProductService.getById(id);

    if (!product) {
      return ApiResponse.error(
        "Product not found",
        404
      );
    }

    return ApiResponse.success(product);
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to fetch product"
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const validation =
      ProductSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const product =
      await ProductService.update(
        id,
        validation.data
      );

    return ApiResponse.success(
      product,
      "Product updated successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      error instanceof Error
        ? error.message
        : "Failed to update product"
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    await ProductService.delete(id);

    return ApiResponse.success(
      null,
      "Product deleted successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      error instanceof Error
        ? error.message
        : "Failed to delete product"
    );
  }
}