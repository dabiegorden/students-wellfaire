import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { generateComplaintDescription } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const decoded = getAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, category } = await request.json();
    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 },
      );
    }

    const description = await generateComplaintDescription(title, category);
    return NextResponse.json({ description }, { status: 200 });
  } catch (error) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 },
    );
  }
}
