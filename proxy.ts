import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  verifyAccessToken,
} from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  const token = request.cookies.get(
    ACCESS_TOKEN_COOKIE
  )?.value;

  const user = token ? verifyAccessToken(token) : null;

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
  matcher: ["/admin/:path*"],
};
