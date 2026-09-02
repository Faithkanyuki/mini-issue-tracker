import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function getCurrentUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  return payload.userId;
}