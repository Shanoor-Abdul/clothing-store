import { ApiResponse } from "@/lib/api-response";
import { clearAuthCookies } from "@/lib/auth";

export async function POST() {
  await clearAuthCookies();

  return ApiResponse.success(null, "Logged out");
}
