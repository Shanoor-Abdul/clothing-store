import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "THIS_MONTH";
    const customMonth = searchParams.get("month"); // YYYY-MM

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    const now = new Date();

    if (range === "TODAY") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (range === "LAST_7_DAYS") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "THIS_MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "MONTH" && customMonth) {
      const [yearStr, monthStr] = customMonth.split("-");
      const year = parseInt(yearStr, 10);
      const monthIdx = parseInt(monthStr, 10) - 1;
      startDate = new Date(year, monthIdx, 1);
      endDate = new Date(year, monthIdx + 1, 0, 23, 59, 59);
    }

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    const orderWhere: any = {
      OR: [{ status: "DELIVERED" }, { paymentStatus: "PAID" }],
    };
    if (startDate || endDate) {
      orderWhere.createdAt = dateFilter;
    }

    // Fetch matching orders
    const orders = await prisma.order.findMany({
      where: orderWhere,
      include: {
        items: true,
      },
    });

    const grossRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    // Collect all product IDs in orders to calculate sales per product, category, collection
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = itemMap.get(item.productId) || {
          name: item.productName || "Product",
          quantity: 0,
          revenue: 0,
        };
        current.quantity += item.quantity;
        current.revenue += Number(item.price || 0) * item.quantity;
        itemMap.set(item.productId, current);
      });
    });

    const productIds = Array.from(itemMap.keys());
    const products = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          include: {
            category: { select: { id: true, name: true } },
            collections: { include: { collection: { select: { id: true, name: true } } } },
            variants: { select: { stock: true } },
          },
        })
      : [];

    const categoryRevenueMap = new Map<string, { name: string; salesCount: number; totalRevenue: number }>();
    const collectionRevenueMap = new Map<string, { name: string; salesCount: number; totalRevenue: number }>();
    const topProductsList: any[] = [];

    products.forEach((prod) => {
      const stats = itemMap.get(prod.id);
      if (!stats) return;

      const totalStock = prod.variants?.reduce((s, v) => s + (v.stock || 0), 0) || (prod.isActive ? 10 : 0);

      topProductsList.push({
        id: prod.id,
        name: prod.name,
        sku: prod.sku,
        categoryName: prod.category?.name || "General",
        unitsSold: stats.quantity,
        totalRevenue: stats.revenue,
        stock: totalStock,
      });

      // Category aggregation
      if (prod.category) {
        const catStats = categoryRevenueMap.get(prod.category.id) || {
          name: prod.category.name,
          salesCount: 0,
          totalRevenue: 0,
        };
        catStats.salesCount += stats.quantity;
        catStats.totalRevenue += stats.revenue;
        categoryRevenueMap.set(prod.category.id, catStats);
      }

      // Collection aggregation
      prod.collections?.forEach((c) => {
        if (c.collection) {
          const colStats = collectionRevenueMap.get(c.collection.id) || {
            name: c.collection.name,
            salesCount: 0,
            totalRevenue: 0,
          };
          colStats.salesCount += stats.quantity;
          colStats.totalRevenue += stats.revenue;
          collectionRevenueMap.set(c.collection.id, colStats);
        }
      });
    });

    topProductsList.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          grossRevenue,
          ordersCount: orders.length,
          deliveredCount: orders.filter((o) => o.status === "DELIVERED").length,
        },
        revenueByCategory: Array.from(categoryRevenueMap.values()),
        revenueByCollection: Array.from(collectionRevenueMap.values()),
        topSellingProducts: topProductsList,
      },
    });
  } catch (error: any) {
    console.error("Revenue API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch revenue analytics" },
      { status: 500 }
    );
  }
}
