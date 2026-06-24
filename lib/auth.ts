import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { verifyToken, JWTPayload } from "@/lib/jwt";
import { db } from "@/src/db";
import { users } from "@/src/schema";

/**
 * Extract and verify the bearer token from a request.
 * Returns the decoded JWT payload or null.
 */
export function getAuth(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Load the full authenticated user (without password) from the DB.
 */
export async function getCurrentUser(request: NextRequest) {
  const decoded = getAuth(request);
  if (!decoded) return null;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
