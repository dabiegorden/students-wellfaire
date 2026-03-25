import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import User from "@/models/User";
import { Types } from "mongoose";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyseComplaintWithAI(
  title: string,
  category: string,
  description: string,
): Promise<{
  aiPriority: "Low" | "Medium" | "High" | "Critical";
  aiExplanation: string;
  aiScore: number;
}> {
  const prompt = `
You are an expert student affairs officer at a university. Analyse the following student complaint and determine its priority level.

Complaint Title: "${title}"
Category: "${category}"
Description: "${description}"

Evaluate urgency based on:
- Potential impact on student wellbeing, academic performance, or safety
- Time-sensitivity of the issue
- Severity and seriousness of the concern
- Whether it affects one student or multiple

Respond with ONLY a valid JSON object in this exact format (no markdown, no explanation outside JSON):
{
  "priority": "Low" | "Medium" | "High" | "Critical",
  "score": <integer 0-100 representing urgency, 100 being most urgent>,
  "explanation": "<2-3 sentences explaining why this priority was assigned and what factors were most important>"
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  const raw = response.text?.trim() ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return {
    aiPriority: parsed.priority,
    aiExplanation: parsed.explanation,
    aiScore: parsed.score,
  };
}

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

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid complaint ID" },
        { status: 400 },
      );
    }

    const complaint = await Complaint.findById(id)
      .populate("studentId", "firstName lastName email studentId")
      .lean();

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    if (
      user.role === "students" &&
      (complaint.studentId as any)._id.toString() !== userId
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

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid complaint ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    if (user.role === "admin") {
      const { adminReply, status, priority, reanalyse } = body;

      if (!adminReply && !status && !priority && !reanalyse) {
        return NextResponse.json(
          { error: "Reply, status, priority, or reanalyse flag is required" },
          { status: 400 },
        );
      }

      const updateData: any = {};

      if (adminReply) {
        updateData.adminReply = adminReply;
        updateData.repliedAt = new Date();
        updateData.adminId = userId;
      }
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;

      // Admin can trigger AI re-analysis
      if (reanalyse) {
        try {
          const aiData = await analyseComplaintWithAI(
            complaint.title,
            complaint.category,
            complaint.description,
          );
          updateData.aiPriority = aiData.aiPriority;
          updateData.aiExplanation = aiData.aiExplanation;
          updateData.aiScore = aiData.aiScore;
          updateData.aiAnalysedAt = new Date();
          // Also update the actual priority to match AI
          updateData.priority = aiData.aiPriority;
        } catch (aiError) {
          console.error("AI re-analysis failed:", aiError);
          return NextResponse.json(
            { error: "AI re-analysis failed" },
            { status: 500 },
          );
        }
      }

      const updatedComplaint = await Complaint.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      ).populate("studentId", "firstName lastName email studentId");

      return NextResponse.json({
        complaint: updatedComplaint,
        message: "Complaint updated successfully",
      });
    } else if (user.role === "students") {
      if (complaint.adminReply) {
        return NextResponse.json(
          { error: "Cannot update complaint after admin reply" },
          { status: 403 },
        );
      }

      if (complaint.studentId.toString() !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (!body.title && !body.description) {
        return NextResponse.json(
          { error: "Missing fields to update" },
          { status: 400 },
        );
      }

      const updateData: any = {};
      if (body.title) updateData.title = body.title;
      if (body.description) updateData.description = body.description;

      // Re-run AI analysis if content changed
      try {
        const aiData = await analyseComplaintWithAI(
          updateData.title ?? complaint.title,
          complaint.category,
          updateData.description ?? complaint.description,
        );
        updateData.aiPriority = aiData.aiPriority;
        updateData.aiExplanation = aiData.aiExplanation;
        updateData.aiScore = aiData.aiScore;
        updateData.priority = aiData.aiPriority;
        updateData.aiAnalysedAt = new Date();
      } catch (aiError) {
        console.error("AI re-analysis on edit failed:", aiError);
      }

      const updatedComplaint = await Complaint.findByIdAndUpdate(
        id,
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

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid complaint ID" },
        { status: 400 },
      );
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

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

    await Complaint.findByIdAndDelete(id);

    return NextResponse.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
