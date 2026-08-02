import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import {
  getCurrentUser,
  verifyAccessToken,
} from "@/lib/auth";
import { randomNumber } from "@/utils";

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get("cs_access_token")?.value;
    const user = token ? verifyAccessToken(token) : null;

    if (!user || user.role !== "USER") {
      return ApiResponse.error(
        "Login required to place an order",
        401
      );
    }

    const body = await request.json();

    const {
      items,
      address,
      paymentMethod,
      total,
    } = body;

    if (!items?.length || !address) {
      return ApiResponse.error("Invalid order payload", 400);
    }

    const savedAddress = await prisma.address.create({
      data: {
        fullName: address.fullName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country || "Saudi Arabia",
        userId: user.id,
      },
    });

    const orderNumber = `ORD-${Date.now()}-${randomNumber(
      1000,
      9999
    )}`;

    // Resolve product names for any items missing names
    const productIds = items.map((i: any) => i.productId).filter(Boolean);
    const productsMap = new Map<string, { name: string; image: string | null }>();
    if (productIds.length > 0) {
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          images: { select: { imageUrl: true }, take: 1 },
        },
      });
      dbProducts.forEach((p) => {
        productsMap.set(p.id, {
          name: p.name,
          image: p.images?.[0]?.imageUrl || null,
        });
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        addressId: savedAddress.id,
        paymentMethod,
        subtotal: total,
        total,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: items.map((item: any) => {
            const pInfo = productsMap.get(item.productId);
            return {
              productId: item.productId,
              variantId: item.variantId ?? null,
              productName: item.productName || item.name || pInfo?.name || "Product Item",
              color: item.color ?? null,
              size: item.size ?? null,
              quantity: item.quantity,
              price: item.price,
            };
          }),
        },
      },
      include: { items: true },
    });

    return ApiResponse.success(
      order,
      "Order placed successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to place order", 500);
  }
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "USER") {
    return ApiResponse.error("Unauthorized", 401);
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true, address: true },
    orderBy: { createdAt: "desc" },
  });

  // Extract all product IDs to enrich order items with product titles and images
  const productIds = Array.from(
    new Set(
      orders
        .flatMap((order) => order.items.map((item) => item.productId))
        .filter(Boolean)
    )
  );

  const productsMap = new Map<string, { name: string; image: string | null }>();
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
    });

    products.forEach((product) => {
      productsMap.set(product.id, {
        name: product.name,
        image: product.images?.[0]?.imageUrl || null,
      });
    });
  }

  const enrichedOrders = orders.map((order) => ({
    ...order,
    items: order.items.map((item) => {
      const prod = productsMap.get(item.productId);
      return {
        ...item,
        productName: item.productName || prod?.name || "Product Item",
        productImage: prod?.image || null,
      };
    }),
  }));

  return ApiResponse.success(enrichedOrders, "Orders fetched");
}
