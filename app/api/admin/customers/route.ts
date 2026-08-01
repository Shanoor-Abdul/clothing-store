import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
            wishlists: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ApiResponse.success(customers, "Customers fetched successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Failed to fetch customers");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return ApiResponse.success(user, "Customer status updated");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Failed to update customer status");
  }
}
