import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { BannerSchema } from "@/features/banner/validation/banner.schema";
import { BannerService } from "@/features/banner/services/banner.service";

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

    const validation = BannerSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const banner = await BannerService.update(id, validation.data);

    return ApiResponse.success(
      banner,
      "Banner updated successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to update banner", 500);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await BannerService.delete(id);

    return ApiResponse.success(null, "Banner deleted successfully");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to delete banner", 500);
  }
}
