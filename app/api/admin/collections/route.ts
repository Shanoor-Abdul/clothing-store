import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { CollectionSchema } from "@/features/collection/validation/collection.schema";
import { CollectionService } from "@/features/collection/services/collection.service";

export async function GET() {
  try {
    const collections = await CollectionService.getAll();

    return ApiResponse.success(collections, "Collections fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch collections", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = CollectionSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const collection = await CollectionService.create(
      validation.data
    );

    return ApiResponse.success(
      collection,
      "Collection created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Collection already exists."
    ) {
      return ApiResponse.error(error.message, 409);
    }

    return ApiResponse.error("Failed to create collection", 500);
  }
}
