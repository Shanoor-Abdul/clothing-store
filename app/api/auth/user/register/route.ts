import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import {
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth";

import prisma from "@/lib/prisma";
import { hashPassword } from "@/features/auth/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = body.email
      ? String(body.email).trim().toLowerCase()
      : null;
    const mobile = body.mobile
      ? String(body.mobile).trim()
      : null;
    const rawPassword = String(body.password ?? "");

    if (!name) {
      return ApiResponse.error("Name is required", 400);
    }

    if (!email && !mobile) {
      return ApiResponse.error(
        "Email or mobile is required",
        400
      );
    }

    if (rawPassword.length < 6) {
      return ApiResponse.error(
        "Password must be at least 6 characters",
        400
      );
    }

    const existing = await prisma.user.findFirst({
      where: email
        ? { email }
        : { mobile },
    });

    if (existing) {
      return ApiResponse.error(
        "Account already exists with provided details",
        409
      );
    }

    const password = await hashPassword(rawPassword);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        password,
      },
    });

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: "USER" as const,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await setAuthCookies(accessToken, refreshToken);

    return ApiResponse.success(
      { user: payload, accessToken },
      "Account created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Registration failed",
      500
    );
  }
}
