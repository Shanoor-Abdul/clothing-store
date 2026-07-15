import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { ProductService } from "@/features/products/services/product.service";
import { ProductSchema } from "@/features/products/validation/product.schema";

export async function GET() {
  try {
    const products = await ProductService.getAll();

    return ApiResponse.success(
      products,
      "Products fetched successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to fetch products"
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
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
      await ProductService.create(
        validation.data
      );

    return ApiResponse.success(
      product,
      "Product created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      error instanceof Error
        ? error.message
        : "Failed to create product"
    );
  }
}