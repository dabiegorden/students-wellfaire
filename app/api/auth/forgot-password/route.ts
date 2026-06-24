import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users, passwordResetCodes } from "@/src/schema";
import { sendPasswordResetCode } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Only send a code if the account exists, but always respond the same way
    // so we don't reveal which emails are registered.
    if (user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await db.insert(passwordResetCodes).values({
        email: normalizedEmail,
        code,
        expiresAt,
      });

      try {
        await sendPasswordResetCode(normalizedEmail, code);
      } catch (err) {
        console.error("Reset email send failed:", err);
      }
    }

    return NextResponse.json({
      message:
        "If an account exists for that email, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
