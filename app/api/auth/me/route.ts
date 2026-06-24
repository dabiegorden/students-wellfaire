import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/src/db";
import { users } from "@/src/schema";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
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

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
