import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  verifyAccessToken,
} from "@/lib/auth";

const getRequestToken = (request: NextRequest) => {
  const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const authHeader = request.headers.get("authorization") ?? "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : undefined;

  return cookieToken || headerToken;
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  const token = getRequestToken(request);
  const user = token ? verifyAccessToken(token) : null;

  if (isAdminApiRoute) {
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  if (isAdminRoute && !isAdminLogin) {
    if (!user || user.role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";

      return NextResponse.redirect(url);
    }
  }

  if (isAdminLogin && user && user.role === "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
