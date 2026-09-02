import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

// Extracts and verifies the logged-in user's id from the request's cookie.
// Returns null if the user is not authenticated.
export function getCurrentUserId(req: NextRequest): string | null {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return payload.userId;
}