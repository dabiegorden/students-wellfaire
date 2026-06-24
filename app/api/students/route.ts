import { NextRequest, NextResponse } from "next/server";
import { and, eq, or, ilike, desc, sql } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { db } from "@/src/db";
import { users } from "@/src/schema";
import { getAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const faculty = searchParams.get("faculty") || "";
    const level = searchParams.get("level") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const conditions = [eq(users.role, "students")];
    if (search) {
      conditions.push(
        or(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.studentId, `%${search}%`),
        )!,
      );
    }
    if (faculty) conditions.push(eq(users.faculty, faculty));
    if (level) conditions.push(eq(users.level, level));

    const whereClause = and(...conditions);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(whereClause);

    const rows = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const students = rows.map(({ password, ...s }) => ({ ...s, _id: s.id }));

    return NextResponse.json({
      students,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      studentId,
      faculty,
      level,
      programme,
      password,
    } = body;

    if (!firstName || !lastName || !email || !studentId || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedStudentId = studentId.toUpperCase();

    const [existing] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, normalizedEmail),
          eq(users.studentId, normalizedStudentId),
        ),
      )
      .limit(1);

    if (existing) {
      if (existing.email === normalizedEmail) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Student ID already exists" },
        { status: 400 },
      );
    }

    const hashed = await bcryptjs.hash(password, 10);

    const [newStudent] = await db
      .insert(users)
      .values({
        role: "students",
        firstName,
        lastName,
        email: normalizedEmail,
        studentId: normalizedStudentId,
        faculty,
        level,
        programme,
        password: hashed,
      })
      .returning();

    const { password: _pw, ...studentResponse } = newStudent;

    return NextResponse.json(
      {
        student: { ...studentResponse, _id: studentResponse.id },
        message: "Student created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
