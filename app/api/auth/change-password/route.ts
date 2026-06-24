import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { db } from "@/src/db";
import { users } from "@/src/schema";
import { getAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcryptjs.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from the current password" },
        { status: 400 },
      );
    }

    const hashed = await bcryptjs.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
