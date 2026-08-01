import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import {
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  setFirebaseCookie,
  clearAuthCookies,
} from "@/lib/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const password = String(body.password ?? "");

    if (!email || !password) {
      return ApiResponse.error("Email and password are required", 400);
    }

    // 1. Authenticate via PostgreSQL DB
    const dbUser = await prisma.user.findFirst({
      where: { email },
    });

    if (!dbUser) {
      return ApiResponse.error("Invalid credentials", 401);
    }

    if (!dbUser.isActive) {
      return ApiResponse.error("Account is suspended", 403);
    }

    const isValidPassword = await bcrypt.compare(password, dbUser.password);
    if (!isValidPassword) {
      return ApiResponse.error("Invalid credentials", 401);
    }

    const payload = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      mobile: dbUser.mobile,
      role: "USER" as const,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await setAuthCookies(accessToken, refreshToken);

    // 2. Optional Firebase Auth sync
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await setFirebaseCookie(idToken);
    } catch (fbErr) {
      console.warn("Firebase login sync skipped:", fbErr);
    }

    return ApiResponse.success(
      { user: payload, accessToken },
      "Logged in successfully"
    );
  } catch (error: any) {
    console.error("User Login Error:", error);
    return ApiResponse.error("Login failed", 500);
  }
}

export async function DELETE() {
  await clearAuthCookies();
  return ApiResponse.success(null, "Logged out successfully");
}