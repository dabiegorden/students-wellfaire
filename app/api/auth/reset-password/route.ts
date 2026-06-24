import { NextRequest, NextResponse } from "next/server";
import { and, eq, desc } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { db } from "@/src/db";
import { users, passwordResetCodes } from "@/src/schema";

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, code, and new password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [resetCode] = await db
      .select()
      .from(passwordResetCodes)
      .where(
        and(
          eq(passwordResetCodes.email, normalizedEmail),
          eq(passwordResetCodes.code, code),
          eq(passwordResetCodes.used, false),
        ),
      )
      .orderBy(desc(passwordResetCodes.createdAt))
      .limit(1);

    if (!resetCode) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 },
      );
    }

    if (new Date(resetCode.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.email, normalizedEmail));

    await db
      .update(passwordResetCodes)
      .set({ used: true })
      .where(eq(passwordResetCodes.id, resetCode.id));

    return NextResponse.json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
