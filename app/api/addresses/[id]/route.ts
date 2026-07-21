import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getCurrentUser();

  if (!auth || auth.role !== "USER") {
    return ApiResponse.error("Unauthorized", 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== auth.id) {
      return ApiResponse.error("Address not found", 404);
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        fullName: body.fullName ?? existing.fullName,
        phone: body.phone ?? existing.phone,
        street: body.street ?? existing.street,
        city: body.city ?? existing.city,
        state:
          body.state !== undefined
            ? body.state
            : existing.state,
        postalCode:
          body.postalCode !== undefined
            ? body.postalCode
            : existing.postalCode,
        country: body.country ?? existing.country,
      },
    });

    return ApiResponse.success(address, "Address updated");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to update address", 500);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getCurrentUser();

  if (!auth || auth.role !== "USER") {
    return ApiResponse.error("Unauthorized", 401);
  }

  try {
    const { id } = await params;

    const existing = await prisma.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== auth.id) {
      return ApiResponse.error("Address not found", 404);
    }

    await prisma.address.delete({ where: { id } });

    return ApiResponse.success(null, "Address deleted");
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to delete address", 500);
  }
}
