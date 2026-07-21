import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireUser() {
  const user = await getCurrentUser();

  if (!user || user.role !== "USER") return null;

  return user;
}

export async function GET() {
  const auth = await requireUser();

  if (!auth) return ApiResponse.error("Unauthorized", 401);

  const addresses = await prisma.address.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse.success(addresses, "Addresses fetched");
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();

  if (!auth) return ApiResponse.error("Unauthorized", 401);

  try {
    const body = await request.json();

    const {
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
    } = body;

    if (!fullName || !phone || !street || !city) {
      return ApiResponse.error(
        "Full name, phone, street and city are required",
        400
      );
    }

    const address = await prisma.address.create({
      data: {
        fullName: String(fullName),
        phone: String(phone),
        street: String(street),
        city: String(city),
        state: state ? String(state) : null,
        postalCode: postalCode ? String(postalCode) : null,
        country: country ? String(country) : "Saudi Arabia",
        userId: auth.id,
      },
    });

    return ApiResponse.success(
      address,
      "Address added",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Failed to add address", 500);
  }
}
