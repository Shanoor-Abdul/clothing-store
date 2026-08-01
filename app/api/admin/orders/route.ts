import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
        address: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ApiResponse.success(orders, "Orders fetched successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Failed to fetch orders");
  }
}
