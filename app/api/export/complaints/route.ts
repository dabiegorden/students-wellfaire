import { NextRequest, NextResponse } from "next/server";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/src/db";
import { complaints } from "@/src/schema";
import { getAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const priority = searchParams.get("priority") || "";

    const conditions = [];
    if (status) conditions.push(eq(complaints.status, status));
    if (category) conditions.push(eq(complaints.category, category));
    if (priority) conditions.push(eq(complaints.priority, priority));
    const whereClause = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(complaints)
      .where(whereClause)
      .orderBy(desc(complaints.createdAt));

    const exportData = rows.map((complaint) => ({
      "Student Name": complaint.studentName || "N/A",
      Email: complaint.studentEmail || "N/A",
      Title: complaint.title,
      Category: complaint.category,
      Priority: complaint.priority,
      Status: complaint.status,
      Description: complaint.description.substring(0, 50) + "...",
      "Date Submitted": new Date(complaint.createdAt).toLocaleDateString(),
      "Admin Reply": complaint.adminReply || "Pending",
    }));

    return NextResponse.json({ data: exportData, count: exportData.length });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export complaints" },
      { status: 500 },
    );
  }
}
