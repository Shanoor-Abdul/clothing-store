import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: true,
        address: true,
        items: true,
      },
    });

    return ApiResponse.success(order, "Order status updated successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Failed to update order status");
  }
}
