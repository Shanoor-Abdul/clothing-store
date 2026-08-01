import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || user.role !== "USER") {
      return ApiResponse.error("Unauthorized", 401);
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return ApiResponse.error("Order not found", 404);
    }

    if (order.userId !== user.id) {
      return ApiResponse.error("Forbidden", 403);
    }

    if (order.status !== "PENDING") {
      return ApiResponse.error(
        "Order cannot be cancelled after confirmation or shipping",
        400
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return ApiResponse.success(updatedOrder, "Order cancelled successfully");
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return ApiResponse.error("Failed to cancel order", 500);
  }
}
