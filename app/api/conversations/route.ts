import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (decoded.role === "admin") {
      const conversations = await Conversation.find({})
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .populate("student", "firstName lastName email studentId lastSeen")
        .lean();

      return NextResponse.json({ conversations });
    }

    // Student: find or create their conversation
    let conversation = await Conversation.findOne({
      student: decoded.userId,
    })
      .populate("student", "firstName lastName email studentId lastSeen")
      .lean();

    if (!conversation) {
      const created = await Conversation.create({ student: decoded.userId });
      conversation = await Conversation.findById(created._id)
        .populate("student", "firstName lastName email studentId lastSeen")
        .lean();
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { studentId } = await request.json();
    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 },
      );
    }

    const student = await User.findOne({ _id: studentId, role: "students" });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    let conversation = await Conversation.findOne({ student: studentId });
    if (!conversation) {
      conversation = await Conversation.create({ student: studentId });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate("student", "firstName lastName email studentId lastSeen")
      .lean();

    return NextResponse.json({ conversation: populated });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
