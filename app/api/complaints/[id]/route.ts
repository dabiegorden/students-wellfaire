import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import User from "@/models/User";
import { Types } from "mongoose";

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

    const userId = (decoded as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const complaintId = id;

    if (!Types.ObjectId.isValid(complaintId)) {
      return NextResponse.json(
        { error: "Invalid complaint ID" },
        { status: 400 },
      );
    }

    const complaint = await Complaint.findById(complaintId)
      .populate("studentId", "firstName lastName email studentId")
      .lean();

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    // Student can only view their own complaints, admin can view all
    if (
      user.role === "students" &&
      complaint.studentId._id.toString() !== userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ complaint }, { status: 200 });
  } catch (error) {
    console.error("Error fetching complaint:", error);
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

    const userId = (decoded as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const complaintId = id;

    if (!Types.ObjectId.isValid(complaintId)) {
      return NextResponse.json(
        { error: "Invalid complaint ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { adminReply, status, priority } = body;

    // Check if user has permission to update
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    // Only admin can reply or change status/priority
    if (user.role === "admin") {
      if (!adminReply && !status && !priority) {
        return NextResponse.json(
          { error: "Reply, status, or priority is required" },
          { status: 400 },
        );
      }

      const updateData: any = {};
      if (adminReply) {
        updateData.adminReply = adminReply;
        updateData.repliedAt = new Date();
        updateData.adminId = userId;
      }
      if (status) {
        updateData.status = status;
      }
      if (priority) {
        updateData.priority = priority;
      }

      const updatedComplaint = await Complaint.findByIdAndUpdate(
        complaintId,
        updateData,
        { new: true },
      ).populate("studentId", "firstName lastName email studentId");

      return NextResponse.json({
        complaint: updatedComplaint,
        message: "Complaint updated successfully",
      });
    } else if (user.role === "students") {
      // Students cannot update complaints that have been replied to
      if (complaint.adminReply) {
        return NextResponse.json(
          { error: "Cannot update complaint after admin reply" },
          { status: 403 },
        );
      }

      // Students can only edit their own complaints
      if (complaint.studentId.toString() !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Students can only update description, title, or priority before admin reply
      if (!body.title && !body.description && !body.priority) {
        return NextResponse.json(
          { error: "Missing fields to update" },
          { status: 400 },
        );
      }

      const updateData: any = {};
      if (body.title) updateData.title = body.title;
      if (body.description) updateData.description = body.description;
      if (body.priority) updateData.priority = body.priority;

      const updatedComplaint = await Complaint.findByIdAndUpdate(
        complaintId,
        updateData,
        { new: true },
      );

      return NextResponse.json({
        complaint: updatedComplaint,
        message: "Complaint updated successfully",
      });
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error updating complaint:", error);
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

    const userId = (decoded as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const complaintId = id;

    if (!Types.ObjectId.isValid(complaintId)) {
      return NextResponse.json(
        { error: "Invalid complaint ID" },
        { status: 400 },
      );
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    // Admin can delete any complaint, students can only delete pending complaints
    if (user.role === "students") {
      if (complaint.studentId.toString() !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (complaint.status !== "Pending") {
        return NextResponse.json(
          { error: "Can only delete pending complaints" },
          { status: 403 },
        );
      }
    } else if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Complaint.findByIdAndDelete(complaintId);

    return NextResponse.json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
