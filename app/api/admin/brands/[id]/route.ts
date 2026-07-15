import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";

import { BrandSchema } from "@/features/brand/validation/brand.schema";
import { BrandService } from "@/features/brand/services/brand.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const brand =
      await BrandService.getById(id);

    if (!brand) {
      return ApiResponse.error(
        "Brand not found",
        404
      );
    }

    return ApiResponse.success(brand);
  } catch (error) {
    return ApiResponse.error(
      "Failed to fetch brand"
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const validation =
      BrandSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        validation.error.flatten()
      );
    }

    const brand =
      await BrandService.update(
        id,
        validation.data
      );

    return ApiResponse.success(
      brand,
      "Brand updated successfully"
    );
  } catch (error) {
    return ApiResponse.error(
      error instanceof Error
        ? error.message
        : "Failed to update brand"
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params;

    await BrandService.delete(id);

    return ApiResponse.success(
      null,
      "Brand deleted successfully"
    );
  } catch (error) {
    return ApiResponse.error(
      error instanceof Error
        ? error.message
        : "Failed to delete brand"
    );
  }
}