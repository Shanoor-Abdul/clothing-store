import { ApiResponse } from "@/lib/api-response";

import { BrandService } from "@/features/brand/services/brand.service";

export async function GET() {
  try {
    const brands =
      await BrandService.getAll();

    const activeBrands =
      brands.filter(
        (brand) => brand.isActive
      );

    return ApiResponse.success(
      activeBrands,
      "Brands fetched successfully"
    );
  } catch (error) {
    return ApiResponse.error(
      "Failed to fetch brands"
    );
  }
}