import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalCustomers,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.category.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalCategories,
          totalOrders,
          totalCustomers,
          totalRevenue: totalRevenue._sum.total ?? 0,
        },
        recentOrders,
        ordersByStatus: ordersByStatus.reduce(
          (acc, curr) => {
            acc[curr.status] = curr._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}