import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: { name: true, profileImage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ApiResponse.success(reviews, "Reviews fetched successfully");
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    return ApiResponse.error("Failed to fetch reviews", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const user = await getCurrentUser();

    if (!user || user.role !== "USER") {
      return ApiResponse.error("Login required to submit a review", 401);
    }

    const body = await request.json();
    const rating = Math.min(5, Math.max(1, Number(body.rating || 5)));
    const comment = body.comment ? String(body.comment).trim() : null;

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        productId,
      },
    });

    let review;
    if (existingReview) {
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment },
      });
    } else {
      review = await prisma.review.create({
        data: {
          rating,
          comment,
          userId: user.id,
          productId,
        },
      });
    }

    // Recalculate average rating & review count for product
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const reviewCount = allReviews.length;
    const avgRating =
      reviewCount > 0
        ? allReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
        : 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: Number(avgRating.toFixed(1)),
        reviewCount,
      },
    });

    return ApiResponse.success(review, "Review submitted successfully", 201);
  } catch (error: any) {
    console.error("Submit Review Error:", error);
    return ApiResponse.error("Failed to submit review", 500);
  }
}
