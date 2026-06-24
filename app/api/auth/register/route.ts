import { NextRequest, NextResponse } from "next/server";
import { eq, or, and } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { db } from "@/src/db";
import { users, students } from "@/src/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      role,
      studentId,
      firstName,
      lastName,
      email,
      faculty,
      level,
      programme,
      password,
      confirmPassword,
    } = body;

    // Validation
    if (!studentId || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Student ID format: UGR or UGW followed by 10 digits (13 chars total)
    if (!/^(UGR|UGW)\d{10}$/i.test(studentId)) {
      return NextResponse.json(
        {
          error:
            "Invalid Student ID. It must start with UGR or UGW followed by digits, totaling 13 characters (e.g., UGR1234567890)",
        },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    const normalizedStudentId = studentId.toUpperCase();
    const normalizedEmail = email.toLowerCase().trim();

    // Verify the Student ID exists in the official student registry
    const [registryMatch] = await db
      .select()
      .from(students)
      .where(eq(students.studentId, normalizedStudentId))
      .limit(1);

    if (!registryMatch) {
      return NextResponse.json(
        {
          error:
            "This Student ID was not found in the university records. Please check your ID or contact the Students Affairs Office.",
        },
        { status: 404 },
      );
    }

    // Check if an account already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, normalizedEmail),
          eq(users.studentId, normalizedStudentId),
        ),
      )
      .limit(1);

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 },
        );
      }
      if (existingUser.studentId === normalizedStudentId) {
        return NextResponse.json(
          { error: "Student ID already registered" },
          { status: 409 },
        );
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        role: role === "admin" ? "admin" : "students",
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentId: normalizedStudentId,
        faculty: faculty ?? registryMatch.faculty,
        level: level ?? registryMatch.level,
        programme: programme ?? registryMatch.programme,
      })
      .returning();

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as "students" | "admin",
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          studentId: newUser.studentId,
          faculty: newUser.faculty,
          programme: newUser.programme,
          level: newUser.level,
        },
        token,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
