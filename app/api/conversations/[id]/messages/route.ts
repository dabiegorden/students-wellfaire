import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { conversations, messages } from "@/src/schema";
import { getAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const decoded = getAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    if (decoded.role === "students" && conversation.student !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(eq(messages.conversation, id));

    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation, id))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const result = rows
      .reverse()
      .map((m) => ({ ...m, _id: m.id }));

    return NextResponse.json({
      messages: result,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
