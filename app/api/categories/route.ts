import { ApiResponse } from "@/lib/api-response";
import { CategoryService } from "@/features/category/services/category.service";

export async function GET() {
  try {
    const categories = await CategoryService.getAll();

    const activeCategories = categories.filter(
      (category) => category.isActive
    );

    return ApiResponse.success(
      activeCategories,
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