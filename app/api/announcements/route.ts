import { NextRequest, NextResponse } from "next/server";
import { and, eq, or, ilike, desc, asc, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { announcements, users } from "@/src/schema";
import { getAuth } from "@/lib/auth";
import { Resend } from "resend";
import { AnnouncementEmailTemplate } from "@/components/AnnouncementEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/announcements — any authenticated user
export async function GET(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const conditions = [];
    if (category) conditions.push(eq(announcements.category, category));
    if (search) {
      conditions.push(
        or(
          ilike(announcements.title, `%${search}%`),
          ilike(announcements.content, `%${search}%`),
        ),
      );
    }
    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(announcements)
      .where(whereClause);

    const rows = await db
      .select()
      .from(announcements)
      .where(whereClause)
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json({
      announcements: rows.map((r) => ({ ...r, _id: r.id })),
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/announcements — admin only
export async function POST(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const { title, category, content, isPinned, sendEmail } =
      await request.json();

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: "Title, category, and content are required" },
        { status: 400 },
      );
    }

    const [announcement] = await db
      .insert(announcements)
      .values({
        title,
        category,
        content,
        isPinned: isPinned ?? false,
        authorId: admin.id,
        authorName: `${admin.firstName} ${admin.lastName}`,
        emailSent: false,
      })
      .returning();

    if (sendEmail) {
      try {
        const studentList = await db
          .select({ email: users.email, firstName: users.firstName })
          .from(users)
          .where(eq(users.role, "students"));

        const platformUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:3000";

        const postedAt = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        const BATCH_SIZE = 50;
        let emailsSent = 0;

        for (let i = 0; i < studentList.length; i += BATCH_SIZE) {
          const batch = studentList.slice(i, i + BATCH_SIZE);
          await Promise.allSettled(
            batch.map((student) =>
              resend.emails.send({
                from: `Students Wellfare <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
                to: [student.email],
                subject: `New Announcement: ${title}`,
                react: AnnouncementEmailTemplate({
                  studentFirstName: student.firstName,
                  announcementTitle: title,
                  announcementCategory: category,
                  announcementContent: content,
                  authorName: `${admin.firstName} ${admin.lastName}`,
                  postedAt,
                  platformUrl,
                }),
              }),
            ),
          );
          emailsSent += batch.length;
        }

        const [updated] = await db
          .update(announcements)
          .set({ emailSent: true, emailSentAt: new Date() })
          .where(eq(announcements.id, announcement.id))
          .returning();

        return NextResponse.json(
          {
            announcement: { ...updated, _id: updated.id },
            message: `Announcement created and emailed to ${emailsSent} student(s)`,
            emailsSent,
          },
          { status: 201 },
        );
      } catch (emailError) {
        console.error("Email blast failed:", emailError);
        return NextResponse.json(
          {
            announcement: { ...announcement, _id: announcement.id },
            message:
              "Announcement created, but email notification failed. Students can still view it on the platform.",
            emailError: true,
          },
          { status: 201 },
        );
      }
    }

    return NextResponse.json(
      {
        announcement: { ...announcement, _id: announcement.id },
        message: "Announcement created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
