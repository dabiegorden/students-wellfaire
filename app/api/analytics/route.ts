import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || (decoded as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get complaints statistics
    const complaintStats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get complaints by priority
    const complaintsByPriority = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get complaints by faculty
    const complaintsByFaculty = await Complaint.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$student.faculty",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total students
    const totalStudents = await User.countDocuments({ role: "students" });

    // Format response
    const stats = complaintStats[0] || {
      total: 0,
      resolved: 0,
      pending: 0,
      inProgress: 0,
      closed: 0,
    };

    const categoryData = complaintsByCategory.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    const priorityData = complaintsByPriority.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    const facultyData = complaintsByFaculty.map((item) => ({
      name: item._id || "Unknown",
      value: item.count,
    }));

    const resolutionRate =
      stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalComplaints: stats.total,
        resolvedComplaints: stats.resolved,
        pendingComplaints: stats.pending,
        inProgressComplaints: stats.inProgress,
        closedComplaints: stats.closed,
        resolutionRate,
        totalStudents,
      },
      categoryData,
      priorityData,
      facultyData,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
