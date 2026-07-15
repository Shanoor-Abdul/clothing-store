import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";

import { CategorySchema } from "@/features/category/validation/category.schema";
import { CategoryService } from "@/features/category/services/category.service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const category = await CategoryService.getById(id);

    if (!category) {
      return ApiResponse.error("Category not found", 404);
    }

    return ApiResponse.success(
      category,
      "Category fetched successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to fetch category",
      500
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const validation = CategorySchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const category = await CategoryService.update(
      id,
      validation.data
    );

    return ApiResponse.success(
      category,
      "Category updated successfully"
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
      "Failed to update category",
      500
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await CategoryService.delete(id);

    return ApiResponse.success(
      null,
      "Category deleted successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to delete category",
      500
    );
  }
}