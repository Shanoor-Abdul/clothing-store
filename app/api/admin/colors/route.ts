import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { ColorSchema } from "@/features/color/validation/color.schema";
import { ColorService } from "@/features/color/services/color.service";

export async function GET() {
  try {
    const colors = await ColorService.getAll();

    return ApiResponse.success(colors, "Colors fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch colors", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = ColorSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const color = await ColorService.create(validation.data);

    return ApiResponse.success(
      color,
      "Color created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Color already exists."
    ) {
      return ApiResponse.error(error.message, 409);
    }

    return ApiResponse.error("Failed to create color", 500);
  }
}
