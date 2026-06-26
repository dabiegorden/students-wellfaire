import { NextRequest, NextResponse } from "next/server";
import { and, eq, or, ilike, desc, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { complaints, users } from "@/src/schema";
import { getCurrentUser } from "@/lib/auth";
import { sendNewComplaintNotificationToAdmins } from "@/lib/resend";
import { scheduleAIAutoReply } from "@/lib/ai-auto-reply";
import { processComplaintAcknowledgement } from "@/lib/complaint-acknowledgement";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "students") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, category, description } = await request.json();
    if (!title || !category || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    console.log("Creating complaint...");
    const [newComplaint] = await db
      .insert(complaints)
      .values({
        studentId: user.id,
        studentName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        studentEmail: user.email,
        title,
        category,
        description,
        priority: "Medium",
        status: "Pending",
        processingStatus: "pending",
      })
      .returning();
    console.log(`Complaint saved (${newComplaint.id}).`);

    // Fire-and-forget the AI triage + acknowledgement + email workflow.
    // The HTTP response is NOT blocked on AI/email; the long-running custom
    // Node server (server.ts) keeps the process alive to complete it.
    void processComplaintAcknowledgement(newComplaint.id).catch((err) =>
      console.error("Acknowledgement workflow crashed:", err),
    );

    // Notify admins by email
    const admins = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, "admin"));
    const adminEmails = admins.map((a) => a.email).filter(Boolean) as string[];

    sendNewComplaintNotificationToAdmins(
      {
        _id: newComplaint.id,
        title: newComplaint.title,
        category: newComplaint.category,
        description: newComplaint.description,
        priority: newComplaint.priority,
        status: newComplaint.status,
        studentName: newComplaint.studentName,
        studentEmail: newComplaint.studentEmail,
      },
      adminEmails,
    ).catch((err) => console.error("Admin notification email failed:", err));

    scheduleAIAutoReply(newComplaint.id);

    return NextResponse.json(
      { complaint: { ...newComplaint, _id: newComplaint.id }, message: "Complaint submitted successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const conditions = [];

    if (user.role === "students") {
      conditions.push(eq(complaints.studentId, user.id));
    } else if (user.role === "admin") {
      if (search) {
        conditions.push(
          or(
            ilike(complaints.title, `%${search}%`),
            ilike(complaints.description, `%${search}%`),
            ilike(complaints.studentName, `%${search}%`),
          ),
        );
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status) conditions.push(eq(complaints.status, status));
    if (category) conditions.push(eq(complaints.category, category));

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(complaints)
      .where(whereClause);

    const rows = await db
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
      .where(whereClause)
      .orderBy(desc(complaints.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const result = rows.map((r) => ({
      ...r.complaint,
      _id: r.complaint.id,
      student: r.student,
    }));

    return NextResponse.json({
      complaints: result,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
