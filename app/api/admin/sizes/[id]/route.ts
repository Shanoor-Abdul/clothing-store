import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { SizeSchema } from "@/features/size/validation/size.schema";
import { SizeService } from "@/features/size/services/size.service";

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

    const validation = SizeSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const size = await SizeService.update(id, validation.data);

    return ApiResponse.success(size, "Size updated successfully");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to update size", 500);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await SizeService.delete(id);

    return ApiResponse.success(null, "Size deleted successfully");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to delete size", 500);
  }
}
