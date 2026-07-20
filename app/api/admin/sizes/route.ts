import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { SizeSchema } from "@/features/size/validation/size.schema";
import { SizeService } from "@/features/size/services/size.service";

export async function GET() {
  try {
    const sizes = await SizeService.getAll();

    return ApiResponse.success(sizes, "Sizes fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch sizes", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = SizeSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const size = await SizeService.create(validation.data);

    return ApiResponse.success(
      size,
      "Size created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to create size", 500);
  }
}
