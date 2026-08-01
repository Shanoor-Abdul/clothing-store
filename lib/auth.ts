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

export const ACCESS_TOKEN_COOKIE = "cs_access_token";
export const REFRESH_TOKEN_COOKIE = "cs_refresh_token";
export const FIREBASE_TOKEN_COOKIE = "token";

export const ACCESS_EXPIRES = "15m";
export const REFRESH_EXPIRES = "7d";

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
  refreshToken: string
) => {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const setFirebaseCookie = async (idToken: string) => {
  const cookieStore = await cookies();

  cookieStore.set(FIREBASE_TOKEN_COOKIE, idToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();

  cookieStore.delete({ name: ACCESS_TOKEN_COOKIE, path: "/" });
  cookieStore.delete({ name: REFRESH_TOKEN_COOKIE, path: "/" });
  cookieStore.delete({ name: FIREBASE_TOKEN_COOKIE, path: "/" });
};

export const getAccessTokenFromCookies = async (): Promise<
  string | undefined
> => {
  const cookieStore = await cookies();

  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
};

export const getFirebaseTokenFromCookies = async (): Promise<
  string | undefined
> => {
  const cookieStore = await cookies();

  return cookieStore.get(FIREBASE_TOKEN_COOKIE)?.value;
};

export const getCurrentUser = async (): Promise<AuthPayload | null> => {
  const token = await getAccessTokenFromCookies();

  if (!token) return null;

  return verifyAccessToken(token);
};