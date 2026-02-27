import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const priority = searchParams.get("priority") || "";

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Get filtered complaints
    const complaints = await Complaint.find(filter)
      .populate("studentId", "firstName lastName email studentId")
      .sort({ createdAt: -1 });

    // Format data for Excel
    const exportData = complaints.map((complaint: any) => ({
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

    return NextResponse.json({
      data: exportData,
      count: exportData.length,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export complaints" },
      { status: 500 },
    );
  }
}
