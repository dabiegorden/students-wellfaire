import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ NEW (important)

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adminReply, status } = await request.json();

    if (!adminReply && !status) {
      return NextResponse.json(
        { error: "Reply or status is required" },
        { status: 400 },
      );
    }

    const updateData: any = {};

    if (adminReply) {
      updateData.adminReply = adminReply;
      updateData.repliedAt = new Date();
    }

    if (status) {
      updateData.status = status;
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id, // ✅ use id from awaited params
      updateData,
      { new: true },
    ).populate("studentId", "firstName lastName email");

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      complaint,
      message: "Complaint updated successfully",
    });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 },
    );
  }
}
