import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Run queries sequentially to prevent connection pool exhaustion (P2024)
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalCategories = await prisma.category.count({ where: { isActive: true } });
    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count({ where: { isActive: true } });
    
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    });

    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    });

    const formattedRevenue = totalRevenue._sum.total
      ? Number(totalRevenue._sum.total)
      : 0;

    const formattedRecentOrders = recentOrders.map((order) => ({
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
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.price || 0),
      })),
    }));

    const formattedOrdersByStatus = ordersByStatus.reduce(
      (acc: Record<string, number>, curr) => {
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
  } catch (error: any) {
    console.error("Dashboard API Detailed Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}