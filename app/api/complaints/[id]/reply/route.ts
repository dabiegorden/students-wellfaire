import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { complaints } from "@/src/schema";
import { getAuth } from "@/lib/auth";
import { sendComplaintReplyNotificationToStudent } from "@/lib/resend";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = getAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adminReply, status } = await request.json();
    if (!adminReply && !status) {
      return NextResponse.json(
        { error: "Reply or status is required" },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (adminReply) {
      updateData.adminReply = adminReply;
      updateData.repliedAt = new Date();
      updateData.repliedBy = "admin";
    }
    if (status) updateData.status = status;

    const [complaint] = await db
      .update(complaints)
      .set(updateData)
      .where(eq(complaints.id, id))
      .returning();

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    if (adminReply) {
      sendComplaintReplyNotificationToStudent(
        {
          _id: complaint.id,
          title: complaint.title,
          category: complaint.category,
          description: complaint.description,
          priority: complaint.priority,
          status: complaint.status,
          studentName: complaint.studentName,
          studentEmail: complaint.studentEmail,
        },
        adminReply,
        "admin",
      ).catch((err) =>
        console.error("Student reply notification email failed:", err),
      );
    }

    return NextResponse.json({
      complaint: { ...complaint, _id: complaint.id },
      message: "Complaint updated successfully",
    });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 },
    );
  }
}
