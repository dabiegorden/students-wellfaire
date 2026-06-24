import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, inArray, isNotNull, desc, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { complaints, users } from "@/src/schema";
import { getAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const countOf = async (clause: any) => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(clause.table)
        .where(clause.where);
      return count;
    };

    const totalStudents = await countOf({
      table: users,
      where: eq(users.role, "students"),
    });
    const totalAdmins = await countOf({
      table: users,
      where: eq(users.role, "admin"),
    });

    const [{ count: totalComplaints }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(complaints);
    const pendingComplaints = await countOf({
      table: complaints,
      where: eq(complaints.status, "Pending"),
    });
    const inProgressComplaints = await countOf({
      table: complaints,
      where: eq(complaints.status, "In Progress"),
    });
    const resolvedComplaints = await countOf({
      table: complaints,
      where: eq(complaints.status, "Resolved"),
    });
    const closedComplaints = await countOf({
      table: complaints,
      where: eq(complaints.status, "Closed"),
    });

    const resolutionRate =
      totalComplaints > 0
        ? Math.round(
            ((resolvedComplaints + closedComplaints) / totalComplaints) * 100,
          )
        : 0;

    const complaintsByPriority = await db
      .select({ _id: complaints.priority, count: sql<number>`count(*)::int` })
      .from(complaints)
      .groupBy(complaints.priority)
      .orderBy(desc(sql`count(*)`));

    const complaintsByCategory = await db
      .select({ _id: complaints.category, count: sql<number>`count(*)::int` })
      .from(complaints)
      .groupBy(complaints.category)
      .orderBy(desc(sql`count(*)`));

    const complaintsByStatus = await db
      .select({ _id: complaints.status, count: sql<number>`count(*)::int` })
      .from(complaints)
      .groupBy(complaints.status);

    const complaintsByFaculty = await db
      .select({ _id: users.faculty, count: sql<number>`count(*)::int` })
      .from(complaints)
      .innerJoin(users, eq(complaints.studentId, users.id))
      .groupBy(users.faculty)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const complaintsLast7Days = await db
      .select({
        _id: sql<string>`to_char(${complaints.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(complaints)
      .where(gte(complaints.createdAt, sevenDaysAgo))
      .groupBy(sql`to_char(${complaints.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${complaints.createdAt}, 'YYYY-MM-DD')`);

    const [avgRow] = await db
      .select({
        avgTime: sql<number>`avg(extract(epoch from (${complaints.repliedAt} - ${complaints.createdAt})) / 3600)`,
      })
      .from(complaints)
      .where(
        and(
          inArray(complaints.status, ["Resolved", "Closed"]),
          isNotNull(complaints.repliedAt),
        ),
      );

    const averageResolutionTime = avgRow?.avgTime
      ? Math.round(Number(avgRow.avgTime) * 10) / 10
      : 0;

    const studentsByFaculty = await db
      .select({ _id: users.faculty, count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "students"))
      .groupBy(users.faculty)
      .orderBy(desc(sql`count(*)`));

    const studentsByLevel = await db
      .select({ _id: users.level, count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "students"))
      .groupBy(users.level)
      .orderBy(users.level);

    const recentRows = await db
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
      .orderBy(desc(complaints.createdAt))
      .limit(5);

    const recentComplaints = recentRows.map((r) => ({
      ...r.complaint,
      _id: r.complaint.id,
      student: r.student,
    }));

    return NextResponse.json({
      stats: {
        users: { totalStudents, totalAdmins, studentsByFaculty, studentsByLevel },
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints,
          closed: closedComplaints,
          resolutionRate,
          averageResolutionTime,
          byPriority: complaintsByPriority,
          byCategory: complaintsByCategory,
          byStatus: complaintsByStatus,
          byFaculty: complaintsByFaculty,
          last7Days: complaintsLast7Days,
        },
        recentActivity: recentComplaints,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
