import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { CollectionSchema } from "@/features/collection/validation/collection.schema";
import { CollectionService } from "@/features/collection/services/collection.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = CollectionSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const collection = await CollectionService.update(
      id,
      validation.data
    );

    return ApiResponse.success(
      collection,
      "Collection updated successfully"
    );
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Collection already exists."
    ) {
      return ApiResponse.error(error.message, 409);
    }

    return ApiResponse.error("Failed to update collection", 500);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await CollectionService.delete(id);

    return ApiResponse.success(
      null,
      "Collection deleted successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to delete collection", 500);
  }
}
