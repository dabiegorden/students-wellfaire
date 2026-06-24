import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { complaints, users } from "@/src/schema";
import { getAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const range = and(
      gte(complaints.createdAt, startDate),
      lte(complaints.createdAt, endDate),
    );

    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        resolved: sql<number>`sum(case when ${complaints.status} = 'Resolved' then 1 else 0 end)::int`,
        pending: sql<number>`sum(case when ${complaints.status} = 'Pending' then 1 else 0 end)::int`,
        inProgress: sql<number>`sum(case when ${complaints.status} = 'In Progress' then 1 else 0 end)::int`,
        closed: sql<number>`sum(case when ${complaints.status} = 'Closed' then 1 else 0 end)::int`,
      })
      .from(complaints)
      .where(range);

    const complaintsByCategory = await db
      .select({ name: complaints.category, value: sql<number>`count(*)::int` })
      .from(complaints)
      .where(range)
      .groupBy(complaints.category);

    const complaintsByPriority = await db
      .select({ name: complaints.priority, value: sql<number>`count(*)::int` })
      .from(complaints)
      .where(range)
      .groupBy(complaints.priority);

    const complaintsByFaculty = await db
      .select({
        name: sql<string>`coalesce(${users.faculty}, 'Unknown')`,
        value: sql<number>`count(*)::int`,
      })
      .from(complaints)
      .innerJoin(users, eq(complaints.studentId, users.id))
      .where(range)
      .groupBy(users.faculty);

    const [{ count: totalStudents }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "students"));

    const total = stats?.total ?? 0;
    const resolved = stats?.resolved ?? 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalComplaints: total,
        resolvedComplaints: resolved,
        pendingComplaints: stats?.pending ?? 0,
        inProgressComplaints: stats?.inProgress ?? 0,
        closedComplaints: stats?.closed ?? 0,
        resolutionRate,
        totalStudents,
      },
      categoryData: complaintsByCategory,
      priorityData: complaintsByPriority,
      facultyData: complaintsByFaculty,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
