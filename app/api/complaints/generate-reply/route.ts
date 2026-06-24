import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { complaints } from "@/src/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateComplaintReply } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { complaintId } = await request.json();
    if (!complaintId) {
      return NextResponse.json(
        { error: "Complaint ID is required" },
        { status: 400 },
      );
    }

    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, complaintId))
      .limit(1);

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    const reply = await generateComplaintReply({
      title: complaint.title,
      category: complaint.category,
      description: complaint.description,
      priority: complaint.priority,
      aiExplanation: complaint.aiExplanation,
    });

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("Error generating reply:", error);
    return NextResponse.json(
      { error: "Failed to generate reply" },
      { status: 500 },
    );
  }
}
