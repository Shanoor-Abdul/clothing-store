import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { ColorSchema } from "@/features/color/validation/color.schema";
import { ColorService } from "@/features/color/services/color.service";

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

    const validation = ColorSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const color = await ColorService.update(id, validation.data);

    return ApiResponse.success(color, "Color updated successfully");
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Color already exists."
    ) {
      return ApiResponse.error(error.message, 409);
    }

    return ApiResponse.error("Failed to update color", 500);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await ColorService.delete(id);

    return ApiResponse.success(null, "Color deleted successfully");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to delete color", 500);
  }
}
