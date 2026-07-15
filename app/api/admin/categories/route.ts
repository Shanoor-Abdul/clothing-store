import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";

import { CategorySchema } from "@/features/category/validation/category.schema";
import { CategoryService } from "@/features/category/services/category.service";

export async function GET() {
  try {
    const categories = await CategoryService.getAll();

    return ApiResponse.success(
      categories,
      "Categories fetched successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to fetch categories",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = CategorySchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const category = await CategoryService.create(
      validation.data
    );

    return ApiResponse.success(
      category,
      "Category created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Category already exists."
    ) {
      return ApiResponse.error(
        error.message,
        409
      );
    }

    return ApiResponse.error(
      "Failed to create category",
      500
    );
  }
}