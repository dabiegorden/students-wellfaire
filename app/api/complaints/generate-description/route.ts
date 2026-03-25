import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { title, category } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 },
      );
    }

    const prompt = `
You are helping a university student write a formal complaint. Based on the title and category below, write a clear, professional, and detailed complaint description in first person (from the student's perspective).

Complaint Title: "${title}"
Category: "${category}"

Write a well-structured description (3-5 sentences) that:
- Describes the problem clearly and professionally
- Includes relevant context a student in this situation would mention
- States what impact this is having on the student
- Maintains a respectful, formal tone appropriate for a university complaint

Return ONLY the description text, no preamble, no labels, no quotes.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const description = response.text?.trim() ?? "";

    return NextResponse.json({ description }, { status: 200 });
  } catch (error) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 },
    );
  }
}
