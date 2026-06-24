import { NextRequest, NextResponse } from "next/server";
import { Langbly, AuthenticationError, RateLimitError } from "langbly";

/**
 * Batch translation endpoint backed by the Langbly translation API
 * (LLM-powered, drop-in replacement for Google Translate v2).
 *
 * POST { texts: string[], target: "tw" | "en", source?: string }
 * Returns { translations: string[] }
 *
 * Requires LAMBLY_API_KEY. If the key is missing or a call fails, the original
 * texts are echoed back so the app keeps working (English fallback).
 *
 * Note: Langbly does not expose a dedicated Twi/Akan language code, so for Twi
 * we translate with an `instructions` directive that forces Ghanaian Twi output.
 */

const TWI_INSTRUCTIONS =
  "Translate the text into Ghanaian Twi (the Akan language spoken in Ghana). " +
  "Respond ONLY with the Twi translation. Keep names, numbers, email addresses, " +
  "and acronyms (such as CUG, UGR, UGW) unchanged.";

const client = process.env.LAMBLY_API_KEY
  ? new Langbly({
      apiKey: process.env.LAMBLY_API_KEY,
      baseUrl: process.env.LAMBLY_BASE_URL || "https://api.langbly.com",
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { texts, target, source } = await request.json();

    if (!Array.isArray(texts) || !target) {
      return NextResponse.json(
        { error: "texts[] and target are required" },
        { status: 400 },
      );
    }

    if (!client) {
      // Graceful fallback: no key configured.
      return NextResponse.json({ translations: texts, fallback: true });
    }

    const isTwi = target === "tw";

    try {
      const results = await client.translate(texts, {
        // Twi has no dedicated code; translate via English + Twi instructions.
        target: isTwi ? "en" : target,
        ...(source ? { source } : {}),
        format: "text",
        context: "University student welfare web app interface",
        ...(isTwi ? { instructions: TWI_INSTRUCTIONS } : {}),
      });

      const translations = results.map((r, i) => r.text ?? texts[i]);
      return NextResponse.json({ translations });
    } catch (err) {
      if (err instanceof AuthenticationError) {
        console.error("Langbly auth error:", err.message);
      } else if (err instanceof RateLimitError) {
        console.error(
          `Langbly rate limited — retry after ${err.retryAfter}s`,
        );
      } else {
        console.error("Langbly translate error:", err);
      }
      // Fall back to original text so the UI never breaks.
      return NextResponse.json({ translations: texts, fallback: true });
    }
  } catch (error) {
    console.error("Translate route error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
