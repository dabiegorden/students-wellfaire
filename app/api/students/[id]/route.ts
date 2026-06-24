import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/schema";
import { getAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [student] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.role, "students")))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { password, ...safe } = student;
    return NextResponse.json({ student: { ...safe, _id: safe.id } });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { firstName, lastName, faculty, level, programme, email } =
      await request.json();

    const [student] = await db
      .update(users)
      .set({
        firstName,
        lastName,
        email: email?.toLowerCase().trim(),
        faculty,
        level,
        programme,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), eq(users.role, "students")))
      .returning();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { password, ...safe } = student;
    return NextResponse.json({
      student: { ...safe, _id: safe.id },
      message: "Student updated successfully",
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [student] = await db
      .delete(users)
      .where(and(eq(users.id, id), eq(users.role, "students")))
      .returning();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
