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
import { comparePassword, hashPassword } from "@/features/auth/utils";

const mapUser = (user: {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: "USER" as const,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = body.email
      ? String(body.email).trim().toLowerCase()
      : null;
    const mobile = body.mobile
      ? String(body.mobile).trim()
      : null;
    const password = String(body.password ?? "");

    if ((!email && !mobile) || !password) {
      return ApiResponse.error(
        "Email or mobile and password are required",
        400
      );
    }

    const user = await prisma.user.findFirst({
      where: email
        ? { email }
        : { mobile },
    });

    if (!user || !user.isActive) {
      return ApiResponse.error(
        "Invalid credentials",
        401
      );
    }

    const valid = await comparePassword(
      password,
      user.password
    );

    if (!valid) {
      return ApiResponse.error(
        "Invalid credentials",
        401
      );
    }

    const payload = mapUser(user);

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await setAuthCookies(accessToken, refreshToken);

    return ApiResponse.success(
      { user: payload, accessToken },
      "Logged in successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Login failed", 500);
  }
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "USER") {
    return ApiResponse.error("Unauthorized", 401);
  }

  return ApiResponse.success({ user }, "Authorized");
}

export async function DELETE() {
  clearAuthCookies();

  return ApiResponse.success(null, "Logged out");
}
