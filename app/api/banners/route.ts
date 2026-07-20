import { ApiResponse } from "@/lib/api-response";
import { BannerService } from "@/features/banner/services/banner.service";

export async function GET() {
  try {
    const banners = await BannerService.getActive();

    return ApiResponse.success(banners, "Banners fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch banners", 500);
  }
}
