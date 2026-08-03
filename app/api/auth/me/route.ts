import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import {
  ACCESS_TOKEN_COOKIE_USER,
  REFRESH_TOKEN_COOKIE_USER,
  ACCESS_TOKEN_COOKIE_ADMIN,
  REFRESH_TOKEN_COOKIE_ADMIN,
  getCurrentUser,
  setAuthCookies,
  signAccessToken,
  verifyRefreshToken,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const isAdmin = request.nextUrl.searchParams.get("role") === "ADMIN";
  const user = await getCurrentUser(isAdmin ? "ADMIN" : "USER");

  if (!user) {
    return ApiResponse.error("Unauthorized", 401);
  }

  return ApiResponse.success({ user }, "Authorized");
}

export async function POST(request: NextRequest) {
  const isAdmin = request.nextUrl.searchParams.get("role") === "ADMIN";
  const cookieName = isAdmin ? REFRESH_TOKEN_COOKIE_ADMIN : REFRESH_TOKEN_COOKIE_USER;

  const refreshToken = request.cookies.get(cookieName)?.value;

  if (!refreshToken) {
    return ApiResponse.error("No refresh token", 401);
  }

  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    return ApiResponse.error("Invalid refresh token", 401);
  }

  const accessToken = signAccessToken(payload);

  await setAuthCookies(accessToken, refreshToken, isAdmin ? "ADMIN" : "USER");

  return ApiResponse.success(
    { user: payload, accessToken },
    "Token refreshed"
  );
}
