import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { db } from "@/src/db";
import { users } from "@/src/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (role && user.role !== role) {
      return NextResponse.json(
        { error: `This email is registered as a ${user.role}, not as ${role}` },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as "students" | "admin",
    });

    let userResponse: Record<string, unknown> = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    if (user.role === "students") {
      userResponse = {
        ...userResponse,
        studentId: user.studentId,
        faculty: user.faculty,
        programme: user.programme,
        level: user.level,
      };
    } else if (user.role === "admin") {
      userResponse = {
        ...userResponse,
        staffId: user.staffId,
        department: user.department,
      };
    }

    return NextResponse.json(
      { message: "Login successful", user: userResponse, token },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
