import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    // Student ID validation: must be UGR or UGW followed by digits, 13 characters total
    if (!/^(UGR|UGW)\d{10}$/i.test(studentId)) {
      return NextResponse.json(
        {
          error:
            "Invalid Student ID. It must start with UGR or UGW followed by digits, totaling 13 characters (e.g., UGR1234567890)",
        },
        { status: 400 },
      );
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Password validation
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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { studentId: normalizedStudentId }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
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

    // Create new student user
    const newUser = new User({
      role: role === "admin" ? "admin" : "students",
      email,
      password,
      firstName,
      lastName,
      studentId: studentId.toUpperCase(),
      faculty,
      level,
      programme,
    });

    await newUser.save();

    // Generate token
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          studentId: newUser.studentId,
          faculty: newUser.faculty,
          programme: newUser.programme,
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
