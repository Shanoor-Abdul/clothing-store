import { ApiResponse } from "@/lib/api-response";

import { ProductService } from "@/features/products/services";

export async function GET() {
  try {
    const products = await ProductService.getPublishedProducts();

    return ApiResponse.success(
      products,
      "Products fetched successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to fetch products"
    );
  }
}