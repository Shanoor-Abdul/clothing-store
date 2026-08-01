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
      include: { address: true, items: true },
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

    // 3. Edit Order Items Request (Before Shipping)
    if (body.items && Array.isArray(body.items)) {
      if (order.status === "SHIPPED" || order.status === "DELIVERED") {
        return ApiResponse.error(
          "Order items cannot be edited after order has shipped",
          400
        );
      }

      if (body.items.length === 0) {
        return ApiResponse.error("Order must contain at least 1 item", 400);
      }

      // Delete existing order items
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Calculate new totals
      let newSubtotal = 0;
      const newItems = body.items.map((item: any) => {
        const itemPrice = Number(item.price || 0);
        const itemQty = Number(item.quantity || 1);
        newSubtotal += itemPrice * itemQty;

        return {
          orderId: id,
          productId: item.productId,
          productName: item.productName || item.name || "Product Item",
          variantId: item.variantId ?? null,
          color: item.color ?? null,
          size: item.size ?? null,
          quantity: itemQty,
          price: itemPrice,
        };
      });

      await prisma.orderItem.createMany({
        data: newItems,
      });

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          subtotal: newSubtotal,
          total: newSubtotal + Number(order.shipping || 0),
        },
        include: { address: true, items: true },
      });

      return ApiResponse.success(
        updatedOrder,
        "Order items updated successfully"
      );
    }

    // 4. Edit Address Request (Before Shipping)
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
