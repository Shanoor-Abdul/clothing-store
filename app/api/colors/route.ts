import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const colors = await prisma.color.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return ApiResponse.success(colors, "Colors fetched");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to fetch colors", 500);
  }
}