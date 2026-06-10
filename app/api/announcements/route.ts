import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";
import User from "@/models/User";
import { Resend } from "resend";
import { AnnouncementEmailTemplate } from "@/components/AnnouncementEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── GET /api/announcements ──────────────────────────────────────────────────
// Accessible by both admin and students (must be authenticated)
export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const filter: any = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Announcement.countDocuments(filter);

    // Pinned announcements always come first, then by newest
    const announcements = await Announcement.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── POST /api/announcements ─────────────────────────────────────────────────
// Admin only — creates announcement and optionally emails all students
export async function POST(request: NextRequest) {
  try {
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

    const userId = (decoded as any).userId;
    const admin = await User.findById(userId);

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, category, content, isPinned, sendEmail } = body;

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: "Title, category, and content are required" },
        { status: 400 },
      );
    }

    const announcement = new Announcement({
      title,
      category,
      content,
      isPinned: isPinned ?? false,
      authorId: userId,
      authorName: `${admin.firstName} ${admin.lastName}`,
      emailSent: false,
    });

    await announcement.save();

    // Send email blast to all students if requested
    if (sendEmail) {
      try {
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

        // Batch emails (Resend allows up to 100 per batch call)
        const BATCH_SIZE = 50;
        let emailsSent = 0;

        for (let i = 0; i < students.length; i += BATCH_SIZE) {
          const batch = students.slice(i, i + BATCH_SIZE);

          const emailPromises = batch.map((student) =>
            resend.emails.send({
              from: `SWIS Platform <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
              to: [student.email],
              subject: `📢 New Announcement: ${title}`,
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
          );

          await Promise.allSettled(emailPromises);
          emailsSent += batch.length;
        }

        // Mark email as sent
        announcement.emailSent = true;
        announcement.emailSentAt = new Date();
        await announcement.save();

        return NextResponse.json(
          {
            announcement,
            message: `Announcement created and emailed to ${emailsSent} student(s)`,
            emailsSent,
          },
          { status: 201 },
        );
      } catch (emailError) {
        console.error("Email blast failed:", emailError);
        // Announcement was still created; just report the email failure
        return NextResponse.json(
          {
            announcement,
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
        announcement,
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
