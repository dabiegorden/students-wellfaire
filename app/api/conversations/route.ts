import { NextRequest, NextResponse } from "next/server";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { conversations, users } from "@/src/schema";
import { getAuth } from "@/lib/auth";

const studentCols = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  studentId: users.studentId,
  lastSeen: users.lastSeen,
};

function shape(row: { conversation: typeof conversations.$inferSelect; student: any }) {
  return {
    ...row.conversation,
    _id: row.conversation.id,
    student: row.student ? { ...row.student, _id: row.student.id } : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (decoded.role === "admin") {
      const rows = await db
        .select({ conversation: conversations, student: studentCols })
        .from(conversations)
        .leftJoin(users, eq(conversations.student, users.id))
        .orderBy(desc(conversations.lastMessageAt), desc(conversations.updatedAt));

      return NextResponse.json({ conversations: rows.map(shape) });
    }

    // Student: find or create their conversation
    let [row] = await db
      .select({ conversation: conversations, student: studentCols })
      .from(conversations)
      .leftJoin(users, eq(conversations.student, users.id))
      .where(eq(conversations.student, decoded.userId))
      .limit(1);

    if (!row) {
      const [created] = await db
        .insert(conversations)
        .values({ student: decoded.userId })
        .returning();
      [row] = await db
        .select({ conversation: conversations, student: studentCols })
        .from(conversations)
        .leftJoin(users, eq(conversations.student, users.id))
        .where(eq(conversations.id, created.id))
        .limit(1);
    }

    return NextResponse.json({ conversation: shape(row) });
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
    const decoded = getAuth(request);
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

    const [student] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.role, "students")))
      .limit(1);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    let [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.student, studentId))
      .limit(1);
    if (!conversation) {
      [conversation] = await db
        .insert(conversations)
        .values({ student: studentId })
        .returning();
    }

    const [row] = await db
      .select({ conversation: conversations, student: studentCols })
      .from(conversations)
      .leftJoin(users, eq(conversations.student, users.id))
      .where(eq(conversations.id, conversation.id))
      .limit(1);

    return NextResponse.json({ conversation: shape(row) });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
