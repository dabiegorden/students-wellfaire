import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import User from "@/models/User";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { complaintId } = body;

    if (!complaintId) {
      return NextResponse.json(
        { error: "Complaint ID is required" },
        { status: 400 },
      );
    }

    const complaint = await Complaint.findById(complaintId).populate(
      "studentId",
      "firstName lastName email",
    );

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 },
      );
    }

    const prompt = `
You are a professional university student affairs officer responding to a student complaint. Write a thoughtful, empathetic, and professional reply.

Complaint Details:
Title: "${complaint.title}"
Category: "${complaint.category}"
Description: "${complaint.description}"
Priority: "${complaint.priority}"
${complaint.aiExplanation ? `AI Assessment: "${complaint.aiExplanation}"` : ""}

Write a professional admin response (3-5 sentences) that:
- Acknowledges the student's concern with empathy
- Addresses the specific issue raised
- Explains what steps will be taken or what the student should expect next
- Maintains a supportive, professional tone appropriate for university administration
- Offers reassurance where appropriate

Return ONLY the reply text, no preamble, no labels, no quotes.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const reply = response.text?.trim() ?? "";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("Error generating reply:", error);
    return NextResponse.json(
      { error: "Failed to generate reply" },
      { status: 500 },
    );
  }
}
