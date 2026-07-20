import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { BannerSchema } from "@/features/banner/validation/banner.schema";
import { BannerService } from "@/features/banner/services/banner.service";

export async function GET() {
  try {
    const banners = await BannerService.getAll();

    return ApiResponse.success(banners, "Banners fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch banners", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = BannerSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const banner = await BannerService.create(validation.data);

    return ApiResponse.success(
      banner,
      "Banner created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to create banner", 500);
  }
}
