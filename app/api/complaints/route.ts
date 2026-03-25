import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import User from "@/models/User";
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
  // Strip markdown fences if present
  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return {
    aiPriority: parsed.priority,
    aiExplanation: parsed.explanation,
    aiScore: parsed.score,
  };
}

export async function POST(request: NextRequest) {
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

    const userId = (decoded as any).userId;
    const user = await User.findById(userId);

    if (!user || user.role !== "students") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, category, description } = body;

    if (!title || !category || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Run AI analysis
    let aiData: {
      aiPriority: "Low" | "Medium" | "High" | "Critical";
      aiExplanation: string;
      aiScore: number;
    } | null = null;

    try {
      aiData = await analyseComplaintWithAI(title, category, description);
    } catch (aiError) {
      console.error("AI analysis failed, using default priority:", aiError);
    }

    const newComplaint = new Complaint({
      studentId: userId,
      studentName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      studentEmail: user.email,
      title,
      category,
      description,
      priority: aiData?.aiPriority ?? "Medium",
      status: "Pending",
      ...(aiData && {
        aiPriority: aiData.aiPriority,
        aiExplanation: aiData.aiExplanation,
        aiScore: aiData.aiScore,
        aiAnalysedAt: new Date(),
      }),
    });

    await newComplaint.save();

    return NextResponse.json(
      {
        complaint: newComplaint,
        message: "Complaint submitted successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    const userId = (decoded as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const filter: any = {};

    if (user.role === "students") {
      filter.studentId = userId;
    } else if (user.role === "admin") {
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { studentName: { $regex: search, $options: "i" } },
        ];
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status) filter.status = status;
    if (category) filter.category = category;

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate("studentId", "firstName lastName email studentId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
