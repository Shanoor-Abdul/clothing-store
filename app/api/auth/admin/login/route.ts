import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import {
  clearAuthCookies,
  getCurrentUser,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth";

import prisma from "@/lib/prisma";
import { comparePassword } from "@/features/auth/utils";

const mapAdmin = (admin: {
  id: string;
  name: string;
  email: string;
}) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  mobile: null,
  role: "ADMIN" as const,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return ApiResponse.error(
        "Email and password are required",
        400
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return ApiResponse.error(
        "Invalid credentials",
        401
      );
    }

    let valid = false;
    try {
      valid = await comparePassword(password, admin.password);
    } catch {
      valid = false;
    }

    // Support plain text fallback for initial seed admins
    if (!valid && password === admin.password) {
      valid = true;
    }

    if (!valid) {
      return ApiResponse.error(
        "Invalid credentials",
        401
      );
    }

    const payload = mapAdmin(admin);

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await setAuthCookies(accessToken, refreshToken);

    return ApiResponse.success(
      { user: payload, accessToken },
      "Admin logged in successfully"
    );
  } catch (error: any) {
    console.error("Admin Login Route Error:", error);

    return ApiResponse.error(error?.message || "Login failed", 500);
  }
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return ApiResponse.error("Unauthorized", 401);
  }

  return ApiResponse.success({ user }, "Authorized");
}

export async function DELETE() {
  await clearAuthCookies();

  return ApiResponse.success(null, "Logged out");
}
