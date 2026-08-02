import { NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

type RecentOrder = Prisma.OrderGetPayload<{
  include: {
    items: true;
    user: { select: { name: true; email: true } };
  };
}>;

export async function GET() {
  try {
    // Run all dashboard database queries concurrently in parallel with Promise.all
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalCustomers,
      recentOrdersResult,
      ordersByStatusResult,
      totalRevenueResult,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }).catch(() => 0),
      prisma.category.count({ where: { isActive: true } }).catch(() => 0),
      prisma.order.count().catch(() => 0),
      prisma.user.count({ where: { isActive: true } }).catch(() => 0),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          user: { select: { name: true, email: true } },
        },
      }).catch(() => []),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }).catch(() => []),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          OR: [
            { status: "DELIVERED" },
            { paymentStatus: "PAID" },
          ],
        },
      }).catch(() => ({ _sum: { total: null } })),
    ]);

    const recentOrders = (recentOrdersResult || []) as RecentOrder[];
    const ordersByStatus = ordersByStatusResult || [];

    const formattedRevenue = totalRevenueResult?._sum?.total
      ? Number(totalRevenueResult._sum.total)
      : 0;

    const formattedRecentOrders = recentOrders.map((order: RecentOrder) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      user: order.user ? { name: order.user.name, email: order.user.email } : null,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping || 0),
      total: Number(order.total || 0),
      createdAt: order.createdAt,
      items: (order.items || []).map((item: RecentOrder["items"][number]) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName || "Product Item",
        variantId: item.variantId,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.price || 0),
      })),
    }));

    const formattedOrdersByStatus = (ordersByStatus || []).reduce(
      (
        acc: Record<string, number>,
        curr: typeof ordersByStatus[number]
      ) => {
        acc[curr.status] = curr._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalCategories,
          totalOrders,
          totalCustomers,
          totalRevenue: formattedRevenue,
        },
        recentOrders: formattedRecentOrders,
        ordersByStatus: formattedOrdersByStatus,
      },
    });
  } catch (error) {
    console.error("Dashboard API Detailed Error:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          stats: {
            totalProducts: 0,
            totalCategories: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalRevenue: 0,
          },
          recentOrders: [],
          ordersByStatus: {},
        },
      },
      { status: 200 }
    );
  }
}