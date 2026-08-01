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
      include: { address: true },
    });

    if (!order) {
      return ApiResponse.error("Order not found", 404);
    }

    if (order.userId !== user.id) {
      return ApiResponse.error("Forbidden", 403);
    }

    const body = await request.json();

    // 1. Cancel Order Request (Before Shipping)
    if (body.action === "CANCEL" || body.status === "CANCELLED") {
      if (order.status === "SHIPPED" || order.status === "DELIVERED") {
        return ApiResponse.error(
          "Order cannot be cancelled after shipping or delivery",
          400
        );
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return ApiResponse.success(updatedOrder, "Order cancelled successfully");
    }

    // 2. 24-Hour Return Request (After Delivery)
    if (body.action === "RETURN") {
      if (order.status !== "DELIVERED") {
        return ApiResponse.error("Only delivered orders can be returned", 400);
      }

      const deliveredAt = new Date(order.updatedAt).getTime();
      const hoursElapsed = (Date.now() - deliveredAt) / (1000 * 60 * 60);

      if (hoursElapsed > 24) {
        return ApiResponse.error(
          "Return window has expired (24 hours after delivery limit)",
          400
        );
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return ApiResponse.success(
        updatedOrder,
        "Return request processed successfully"
      );
    }

    // 3. Edit Address Request (Before Shipping)
    if (body.address) {
      if (order.status === "SHIPPED" || order.status === "DELIVERED") {
        return ApiResponse.error(
          "Address cannot be updated after order has shipped",
          400
        );
      }

      if (order.addressId) {
        await prisma.address.update({
          where: { id: order.addressId },
          data: {
            fullName: body.address.fullName,
            phone: body.address.phone,
            street: body.address.street,
            city: body.address.city,
            state: body.address.state,
            country: body.address.country || "Saudi Arabia",
          },
        });
      }

      const updatedOrder = await prisma.order.findUnique({
        where: { id },
        include: { address: true, items: true },
      });

      return ApiResponse.success(
        updatedOrder,
        "Delivery address updated successfully"
      );
    }

    return ApiResponse.error("No valid action specified", 400);
  } catch (error: any) {
    console.error("Update Order Error:", error);
    return ApiResponse.error("Failed to update order", 500);
  }
}
