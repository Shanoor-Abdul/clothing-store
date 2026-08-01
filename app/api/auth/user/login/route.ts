import { NextRequest } from "next/server";

import { ApiResponse } from "@/lib/api-response";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const mapUser = (user: {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  role: string;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role as "USER" | "ADMIN",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = body.email
      ? String(body.email).trim().toLowerCase()
      : null;
    const password = String(body.password ?? "");

    if (!email || !password) {
      return ApiResponse.error(
        "Email and password are required",
        400
      );
    }

    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        return ApiResponse.error("Invalid credentials", 401);
      }
      return ApiResponse.error("Login failed", 500);
    }

    const user = userCredential.user;
    const uid = user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    const userData = userDoc.data() || {};

    const payload = {
      id: uid,
      name: userData.name || user.displayName || "",
      email: userData.email || email,
      mobile: userData.mobile || null,
      role: (userData.role || "USER") as "USER" | "ADMIN",
    };

    const idToken = await user.getIdToken();

    return ApiResponse.success(
      { user: payload, accessToken: idToken },
      "Logged in successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error("Login failed", 500);
  }
}

export async function DELETE(request: NextRequest) {
  return ApiResponse.success(null, "Logged out");
}