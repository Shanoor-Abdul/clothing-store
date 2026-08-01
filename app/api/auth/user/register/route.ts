import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import {
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  setFirebaseCookie,
} from "@/lib/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const mobile = body.mobile ? String(body.mobile).trim() : null;
    const rawPassword = String(body.password ?? "");

    if (!name) {
      return ApiResponse.error("Name is required", 400);
    }

    if (!email) {
      return ApiResponse.error("Email is required", 400);
    }

    if (rawPassword.length < 6) {
      return ApiResponse.error(
        "Password must be at least 6 characters",
        400
      );
    }

    // Check if user already exists in PostgreSQL DB
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(mobile ? [{ mobile }] : []),
        ],
      },
    });

    if (existingUser) {
      return ApiResponse.error("User with this email or mobile already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        password: hashedPassword,
        isActive: true,
      },
    });

    const payload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      role: "USER" as const,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await setAuthCookies(accessToken, refreshToken);

    // Optional Firebase Auth sync if Firebase is active
    try {
      if (email && rawPassword) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, rawPassword);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken();
        await setFirebaseCookie(idToken);
        await setDoc(doc(db, "users", fbUser.uid), {
          name,
          email,
          mobile,
          role: "USER",
          createdAt: new Date(),
          isActive: true,
        });
      }
    } catch (fbErr) {
      console.warn("Firebase sync skipped during registration:", fbErr);
    }

    return ApiResponse.success(
      { user: payload, accessToken },
      "Account created successfully",
      201
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return ApiResponse.error(
      error?.message || "Registration failed",
      500
    );
  }
}