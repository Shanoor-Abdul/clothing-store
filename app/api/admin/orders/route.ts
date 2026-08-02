import { type OrderStatus, type Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

type AdminOrder = Prisma.OrderGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        mobile: true;
      };
    };
    address: true;
    items: true;
  };
}>;

type ProductPreview = {
  id: string;
  name: string;
  images: Array<{ imageUrl: string }>;
};

type ProductMapItem = {
  name: string;
  image: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const where =
      status && status !== "ALL"
        ? { status: status as OrderStatus }
        : undefined;

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
    }) as AdminOrder[];

    // Extract product IDs to attach product images & fallbacks
    const productIds = Array.from(
      new Set(
        orders
          .flatMap((order) => order.items.map((item) => item.productId))
          .filter(Boolean)
      )
    );

    const productsMap = new Map<string, ProductMapItem>();
    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          images: {
            select: { imageUrl: true },
            take: 1,
          },
        },
      }) as ProductPreview[];

      products.forEach((product) => {
        productsMap.set(product.id, {
          name: product.name,
          image: product.images?.[0]?.imageUrl || null,
        });
      });
    }

    const enrichedOrders = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping || 0),
      total: Number(order.total || 0),
      items: order.items.map((item) => {
        const prod = productsMap.get(item.productId);
        return {
          ...item,
          productName: item.productName || prod?.name || "Product Item",
          productImage: prod?.image || null,
          price: Number(item.price || 0),
        };
      }),
    }));

    return ApiResponse.success(enrichedOrders, "Orders fetched successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Failed to fetch orders");
  }
}
