import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Complaint from "@/models/Complaint";

export async function GET(request: NextRequest) {
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

    // User statistics
    const totalStudents = await User.countDocuments({ role: "students" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Complaint statistics
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({
      status: "Pending",
    });
    const inProgressComplaints = await Complaint.countDocuments({
      status: "In Progress",
    });
    const resolvedComplaints = await Complaint.countDocuments({
      status: "Resolved",
    });
    const closedComplaints = await Complaint.countDocuments({
      status: "Closed",
    });

    // Calculate resolution rate
    const resolutionRate =
      totalComplaints > 0
        ? Math.round(
            ((resolvedComplaints + closedComplaints) / totalComplaints) * 100,
          )
        : 0;

    // Complaints by priority
    const complaintsByPriority = await Complaint.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Complaints by faculty
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
        $group: {
          _id: "$student.faculty",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Recent complaints trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const complaintsLast7Days = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Average resolution time (in hours)
    const resolvedComplaintsWithTime = await Complaint.aggregate([
      {
        $match: {
          status: { $in: ["Resolved", "Closed"] },
          repliedAt: { $exists: true },
        },
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ["$repliedAt", "$createdAt"] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$resolutionTime" },
        },
      },
    ]);

    const averageResolutionTime =
      resolvedComplaintsWithTime.length > 0
        ? Math.round(resolvedComplaintsWithTime[0].avgTime * 10) / 10
        : 0;

    // Students by faculty
    const studentsByFaculty = await User.aggregate([
      {
        $match: { role: "students" },
      },
      {
        $group: {
          _id: "$faculty",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Students by level
    const studentsByLevel = await User.aggregate([
      {
        $match: { role: "students" },
      },
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Recent activity
    const recentComplaints = await Complaint.find()
      .populate("studentId", "firstName lastName email studentId")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      stats: {
        users: {
          totalStudents,
          totalAdmins,
          studentsByFaculty,
          studentsByLevel,
        },
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
