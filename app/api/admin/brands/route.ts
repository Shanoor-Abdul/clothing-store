import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";

import { BrandSchema } from "@/features/brand/validation/brand.schema";
import { BrandService } from "@/features/brand/services/brand.service";

export async function GET() {
  try {
    const brands = await BrandService.getAll();

    return ApiResponse.success(
      brands,
      "Brands fetched successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to fetch brands"
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const validation =
      BrandSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const brand =
      await BrandService.create(
        validation.data
      );

    return ApiResponse.success(
      brand,
      "Brand created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      error instanceof Error
        ? error.message
        : "Failed to create brand"
    );
  }
}