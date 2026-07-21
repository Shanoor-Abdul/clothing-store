import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return ApiResponse.success(collections, "Collections fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch collections", 500);
  }
}