import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getCurrentUser,
  setAuthCookies,
  signAccessToken,
  verifyRefreshToken,
} from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return ApiResponse.error("Unauthorized", 401);
  }

  return ApiResponse.success({ user }, "Authorized");
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(
    REFRESH_TOKEN_COOKIE
  )?.value;

  if (!refreshToken) {
    return ApiResponse.error("No refresh token", 401);
  }

  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    return ApiResponse.error("Invalid refresh token", 401);
  }

  const accessToken = signAccessToken(payload);

  await setAuthCookies(accessToken, refreshToken);

  return ApiResponse.success(
    { user: payload, accessToken },
    "Token refreshed"
  );
}
