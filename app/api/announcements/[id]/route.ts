import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { announcements, users } from "@/src/schema";
import { getAuth } from "@/lib/auth";
import { Resend } from "resend";
import { AnnouncementEmailTemplate } from "@/components/AnnouncementEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const decoded = getAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      announcement: { ...announcement, _id: announcement.id },
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
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
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, category, content, isPinned, resendEmail } =
      await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (content !== undefined) updateData.content = content;
    if (isPinned !== undefined) updateData.isPinned = isPinned;

    let [announcement] = await db
      .update(announcements)
      .set(updateData)
      .where(eq(announcements.id, id))
      .returning();

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 },
      );
    }

    if (resendEmail) {
      try {
        const [admin] = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);
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
        for (let i = 0; i < studentList.length; i += BATCH_SIZE) {
          const batch = studentList.slice(i, i + BATCH_SIZE);
          await Promise.allSettled(
            batch.map((student) =>
              resend.emails.send({
                from: `Students Wellfare <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
                to: [student.email],
                subject: `[Updated] Announcement: ${announcement.title}`,
                react: AnnouncementEmailTemplate({
                  studentFirstName: student.firstName,
                  announcementTitle: announcement.title,
                  announcementCategory: announcement.category,
                  announcementContent: announcement.content,
                  authorName: admin
                    ? `${admin.firstName} ${admin.lastName}`
                    : announcement.authorName,
                  postedAt,
                  platformUrl,
                }),
              }),
            ),
          );
        }

        [announcement] = await db
          .update(announcements)
          .set({ emailSent: true, emailSentAt: new Date() })
          .where(eq(announcements.id, id))
          .returning();
      } catch (emailError) {
        console.error("Re-send email failed:", emailError);
      }
    }

    return NextResponse.json({
      announcement: { ...announcement, _id: announcement.id },
      message: "Announcement updated successfully",
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
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
    const decoded = getAuth(request);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [announcement] = await db
      .delete(announcements)
      .where(eq(announcements.id, id))
      .returning();

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
