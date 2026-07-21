import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sizes = await prisma.size.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return ApiResponse.success(sizes, "Sizes fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch sizes", 500);
  }
}