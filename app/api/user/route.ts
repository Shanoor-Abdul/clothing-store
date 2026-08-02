import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { comparePassword, hashPassword } from "@/features/auth/utils";

async function requireUser() {
  const user = await getCurrentUser();

  if (!user || user.role !== "USER") {
    return null;
  }

  return user;
}

export async function GET() {
  const auth = await requireUser();

  if (!auth) {
    return ApiResponse.error("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      gender: true,
      profileImage: true,
      createdAt: true,
      addresses: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return ApiResponse.success(user, "Profile fetched");
}

export async function PUT(request: NextRequest) {
  const auth = await requireUser();

  if (!auth) {
    return ApiResponse.error("Unauthorized", 401);
  }

  try {
    const body = await request.json();

    const name = body.name ? String(body.name).trim() : undefined;
    const email = body.email
      ? String(body.email).trim().toLowerCase()
      : undefined;
    const mobile = body.mobile
      ? String(body.mobile).trim()
      : undefined;
    const gender = body.gender ? String(body.gender).trim() : undefined;
    const currentPassword = body.currentPassword
      ? String(body.currentPassword)
      : "";
    const newPassword = body.newPassword
      ? String(body.newPassword)
      : "";

    const existing = await prisma.user.findUnique({
      where: { id: auth.id },
    });

    if (!existing) {
      return ApiResponse.error("User not found", 404);
    }

    if (newPassword) {
      if (!currentPassword) {
        return ApiResponse.error(
          "Current password is required to set a new password",
          400
        );
      }

      const valid = await comparePassword(
        currentPassword,
        existing.password
      );

      if (!valid) {
        return ApiResponse.error(
          "Current password is incorrect",
          400
        );
      }

      if (newPassword.length < 6) {
        return ApiResponse.error(
          "New password must be at least 6 characters",
          400
        );
      }
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (mobile) dataToUpdate.mobile = mobile;
    if (gender !== undefined) dataToUpdate.gender = gender;
    if (newPassword) {
      dataToUpdate.password = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: auth.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        gender: true,
        profileImage: true,
      },
    });

    return ApiResponse.success(updated, "Profile updated");
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return ApiResponse.error(
        "Email or mobile already in use",
        409
      );
    }

    return ApiResponse.error("Failed to update profile", 500);
  }
}
