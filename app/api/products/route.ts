import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const color = searchParams.get("color");
    const size = searchParams.get("size");
    const collection = searchParams.get("collection");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: Record<string, unknown> = {
      isActive: true,
      status: "PUBLISHED",
    };

    if (category) {
      where.categoryId = category;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        {
          description: { contains: search, mode: "insensitive" },
        },
        {
          shortDescription: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const ORConditions: Array<{ sellingPrice?: { gte: number }; price?: { lte: number } }> = [];

    if (minPrice || maxPrice) {
      const priceCondition: Record<string, number> = {};
      if (minPrice) priceCondition.sellingPrice = Number(minPrice);
      if (maxPrice) priceCondition.price = Number(maxPrice);
      
      if (minPrice && maxPrice) {
        ORConditions.push({
          sellingPrice: { gte: Number(minPrice) },
          price: { lte: Number(maxPrice) },
        } as any);
      } else if (minPrice) {
        ORConditions.push({ sellingPrice: { gte: Number(minPrice) } });
      } else if (maxPrice) {
        ORConditions.push({ price: { lte: Number(maxPrice) } });
      }
    }

    if (ORConditions.length > 0) {
      where.OR = (where.OR as any[]) || [];
      ORConditions.forEach(cond => (where.OR as any[]).push(cond));
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
        variants: {
          include: {
            color: true,
            size: true,
          },
        },
        collections: {
          include: {
            collection: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let filteredProducts = products;

    if (color) {
      filteredProducts = filteredProducts.filter((p: any) =>
        p.variants?.some((v: any) => v.colorId === color)
      );
    }

    if (size) {
      filteredProducts = filteredProducts.filter((p: any) =>
        p.variants?.some((v: any) => v.sizeId === size)
      );
    }

    if (collection) {
      filteredProducts = filteredProducts.filter((p: any) =>
        p.collections?.some((pc: any) => pc.collectionId === collection)
      );
    }

    return ApiResponse.success(filteredProducts, "Products fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch products", 500);
  }
}