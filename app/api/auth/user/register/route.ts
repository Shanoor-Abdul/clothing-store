import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

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

    if (!email) {
      return ApiResponse.error("Email is required", 400);
    }

    if (!mobile) {
      return ApiResponse.error("Mobile is required", 400);
    }

    if (rawPassword.length < 6) {
      return ApiResponse.error(
        "Password must be at least 6 characters",
        400
      );
    }

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, rawPassword);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        return ApiResponse.error("Account already exists", 409);
      }
      return ApiResponse.error("Registration failed", 500);
    }

    const user = userCredential.user;
    const uid = user.uid;

    const payload = {
      id: uid,
      name,
      email,
      mobile,
      role: "USER" as const,
    };

    await setDoc(doc(db, "users", uid), {
      name,
      email,
      mobile,
      role: "USER",
      createdAt: new Date(),
      isActive: true,
    });

    const idToken = await user.getIdToken();

    return ApiResponse.success(
      { user: payload, accessToken: idToken },
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