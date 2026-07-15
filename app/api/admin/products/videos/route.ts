import { NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const productId =
      request.nextUrl.searchParams.get("productId");

    if (!productId) {
      return ApiResponse.error(
        "Product Id is required",
        400
      );
    }

    const videos = await prisma.productVideo.findMany({
      where: {
        productId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return ApiResponse.success(videos);
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to fetch product videos"
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const {
      productId,
      videoUrl,
      thumbnailUrl,
      duration,
    } = body;

    const video =
      await prisma.productVideo.create({
        data: {
          productId,
          videoUrl,
          thumbnailUrl:
            thumbnailUrl || null,
          duration: duration || null,
        },
      });

    return ApiResponse.success(
      video,
      "Product video uploaded successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to upload video"
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const id =
      request.nextUrl.searchParams.get("id");

    if (!id) {
      return ApiResponse.error(
        "Video Id is required",
        400
      );
    }

    await prisma.productVideo.delete({
      where: {
        id,
      },
    });

    return ApiResponse.success(
      null,
      "Video deleted successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Failed to delete video"
    );
  }
}