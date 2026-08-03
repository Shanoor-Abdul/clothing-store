import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type AuthRole = "ADMIN" | "USER";

export interface AuthPayload {
  id: string;
  email?: string | null;
  name?: string | null;
  mobile?: string | null;
  role: AuthRole;
}

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me";

export const ACCESS_TOKEN_COOKIE_USER = "cs_user_access_token";
export const REFRESH_TOKEN_COOKIE_USER = "cs_user_refresh_token";

export const ACCESS_TOKEN_COOKIE_ADMIN = "cs_admin_access_token";
export const REFRESH_TOKEN_COOKIE_ADMIN = "cs_admin_refresh_token";

export const ACCESS_EXPIRES = "7d";
export const REFRESH_EXPIRES = "30d";

const getCookieName = (type: "access" | "refresh", role: AuthRole) => {
  if (role === "ADMIN") {
    return type === "access" ? ACCESS_TOKEN_COOKIE_ADMIN : REFRESH_TOKEN_COOKIE_ADMIN;
  }
  return type === "access" ? ACCESS_TOKEN_COOKIE_USER : REFRESH_TOKEN_COOKIE_USER;
};

export const signAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
};

export const signRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
};

export const verifyAccessToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as AuthPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as AuthPayload;
  } catch {
    return null;
  }
};

export const setAuthCookies = async (
  accessToken: string,
  refreshToken: string,
  role: AuthRole = "USER"
) => {
  const cookieStore = await cookies();

  cookieStore.set(getCookieName("access", role), accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set(getCookieName("refresh", role), refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
};

export const clearAuthCookies = async (role?: AuthRole) => {
  const cookieStore = await cookies();

  if (role) {
    cookieStore.delete({ name: getCookieName("access", role), path: "/" });
    cookieStore.delete({ name: getCookieName("refresh", role), path: "/" });
  } else {
    // Clear both if no role specified
    cookieStore.delete({ name: ACCESS_TOKEN_COOKIE_USER, path: "/" });
    cookieStore.delete({ name: REFRESH_TOKEN_COOKIE_USER, path: "/" });
    cookieStore.delete({ name: ACCESS_TOKEN_COOKIE_ADMIN, path: "/" });
    cookieStore.delete({ name: REFRESH_TOKEN_COOKIE_ADMIN, path: "/" });
  }
};

export const getAccessTokenFromCookies = async (role: AuthRole = "USER"): Promise<
  string | undefined
> => {
  const cookieStore = await cookies();

  return cookieStore.get(getCookieName("access", role))?.value;
};

export const getCurrentUser = async (role: AuthRole = "USER"): Promise<AuthPayload | null> => {
  const token = await getAccessTokenFromCookies(role);

  if (!token) return null;

  return verifyAccessToken(token);
};