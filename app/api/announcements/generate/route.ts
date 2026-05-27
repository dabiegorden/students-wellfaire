import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── POST /api/announcements/generate ───────────────────────────────────────
// Admin only — generates announcement body from title + category using Gemini
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || (decoded as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
You are the student affairs communications officer for a university. Write a professional, clear, and friendly announcement for students.

Announcement Title: "${title}"
Category: "${category}"

Write a well-structured announcement body (3–5 sentences or short paragraphs) that:
- Opens with a clear statement of the announcement
- Provides relevant context, details, or action required from students
- Includes any important dates or deadlines if applicable (keep them generic if unknown)
- Maintains a warm but professional tone suitable for a university notice board
- Is self-contained and does not reference external links

Return ONLY the announcement body text. No subject line, no heading, no preamble, no quotes.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const content = response.text?.trim() ?? "";

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error("Error generating announcement content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 },
    );
  }
}
