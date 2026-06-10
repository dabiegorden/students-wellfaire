import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";
import User from "@/models/User";
import { Types } from "mongoose";
import { Resend } from "resend";
import { AnnouncementEmailTemplate } from "@/components/AnnouncementEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── GET /api/announcements/[id] ─────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid announcement ID" },
        { status: 400 },
      );
    }

    const announcement = await Announcement.findById(id).lean();

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── PATCH /api/announcements/[id] ──────────────────────────────────────────
// Admin only — update title, category, content, isPinned; optionally re-send emails
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || (decoded as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid announcement ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { title, category, content, isPinned, resendEmail } = body;

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 },
      );
    }

    if (title !== undefined) announcement.title = title;
    if (category !== undefined) announcement.category = category;
    if (content !== undefined) announcement.content = content;
    if (isPinned !== undefined) announcement.isPinned = isPinned;

    await announcement.save();

    // Optionally re-send email blast after edit
    if (resendEmail) {
      try {
        const userId = (decoded as any).userId;
        const admin = await User.findById(userId);
        const students = await User.find({ role: "students" }).select(
          "email firstName",
        );

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
        for (let i = 0; i < students.length; i += BATCH_SIZE) {
          const batch = students.slice(i, i + BATCH_SIZE);
          await Promise.allSettled(
            batch.map((student) =>
              resend.emails.send({
                from: `SWIS Platform <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
                to: [student.email],
                subject: `📢 [Updated] Announcement: ${announcement.title}`,
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

        announcement.emailSent = true;
        announcement.emailSentAt = new Date();
        await announcement.save();
      } catch (emailError) {
        console.error("Re-send email failed:", emailError);
      }
    }

    return NextResponse.json({
      announcement,
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

// ── DELETE /api/announcements/[id] ─────────────────────────────────────────
// Admin only
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || (decoded as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid announcement ID" },
        { status: 400 },
      );
    }

    const announcement = await Announcement.findByIdAndDelete(id);

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
