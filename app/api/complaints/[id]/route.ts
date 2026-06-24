import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { complaints, users } from "@/src/schema";
import { getCurrentUser } from "@/lib/auth";
import { analyseComplaintWithAI } from "@/lib/ai";

async function loadComplaintWithStudent(id: string) {
  const [row] = await db
    .select({
      complaint: complaints,
      student: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        studentId: users.studentId,
      },
    })
    .from(complaints)
    .leftJoin(users, eq(complaints.studentId, users.id))
    .where(eq(complaints.id, id))
    .limit(1);
  if (!row) return null;
  return { ...row.complaint, _id: row.complaint.id, student: row.student };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const complaint = await loadComplaintWithStudent(id);
    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    if (user.role === "students" && complaint.studentId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ complaint }, { status: 200 });
  } catch (error) {
    console.error("Error fetching complaint:", error);
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, id))
      .limit(1);

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    if (user.role === "admin") {
      const { adminReply, status, priority, reanalyse } = body;
      if (!adminReply && !status && !priority && !reanalyse) {
        return NextResponse.json(
          { error: "Reply, status, priority, or reanalyse flag is required" },
          { status: 400 },
        );
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (adminReply) {
        updateData.adminReply = adminReply;
        updateData.repliedAt = new Date();
        updateData.repliedBy = "admin";
        updateData.adminId = user.id;
      }
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;

      if (reanalyse) {
        try {
          const aiData = await analyseComplaintWithAI(
            complaint.title,
            complaint.category,
            complaint.description,
          );
          updateData.aiPriority = aiData.aiPriority;
          updateData.aiExplanation = aiData.aiExplanation;
          updateData.aiScore = aiData.aiScore;
          updateData.aiAnalysedAt = new Date();
          updateData.priority = aiData.aiPriority;
        } catch (aiError) {
          console.error("AI re-analysis failed:", aiError);
          return NextResponse.json(
            { error: "AI re-analysis failed" },
            { status: 500 },
          );
        }
      }

      await db.update(complaints).set(updateData).where(eq(complaints.id, id));
      const updated = await loadComplaintWithStudent(id);

      return NextResponse.json({
        complaint: updated,
        message: "Complaint updated successfully",
      });
    } else if (user.role === "students") {
      if (complaint.adminReply) {
        return NextResponse.json(
          { error: "Cannot update complaint after admin reply" },
          { status: 403 },
        );
      }
      if (complaint.studentId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!body.title && !body.description) {
        return NextResponse.json(
          { error: "Missing fields to update" },
          { status: 400 },
        );
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (body.title) updateData.title = body.title;
      if (body.description) updateData.description = body.description;

      try {
        const aiData = await analyseComplaintWithAI(
          (body.title ?? complaint.title) as string,
          complaint.category,
          (body.description ?? complaint.description) as string,
        );
        updateData.aiPriority = aiData.aiPriority;
        updateData.aiExplanation = aiData.aiExplanation;
        updateData.aiScore = aiData.aiScore;
        updateData.priority = aiData.aiPriority;
        updateData.aiAnalysedAt = new Date();
      } catch (aiError) {
        console.error("AI re-analysis on edit failed:", aiError);
      }

      await db.update(complaints).set(updateData).where(eq(complaints.id, id));
      const updated = await loadComplaintWithStudent(id);

      return NextResponse.json({
        complaint: updated,
        message: "Complaint updated successfully",
      });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Error updating complaint:", error);
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, id))
      .limit(1);

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    if (user.role === "students") {
      if (complaint.studentId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (complaint.status !== "Pending") {
        return NextResponse.json(
          { error: "Can only delete pending complaints" },
          { status: 403 },
        );
      }
    } else if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(complaints).where(eq(complaints.id, id));

    return NextResponse.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
