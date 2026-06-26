import OpenAI from "openai";

const endpoint = "https://models.github.ai/inference";

export const ai = new OpenAI({
  baseURL: endpoint,
  apiKey: process.env.GITHUB_TOKEN,
});

// Primary model (GitHub Models free tier). Fallback is used automatically when
// the primary is overloaded (503) / rate-limited (429) / unavailable.
export const AI_MODEL = "openai/gpt-4o";
const FALLBACK_MODELS = ["openai/gpt-4o-mini"];

export type AIPriority = "Low" | "Medium" | "High" | "Critical";

export interface AIAnalysis {
  aiPriority: AIPriority;
  aiExplanation: string;
  aiScore: number;
}

/**
 * Generate text with the primary model, transparently falling back to
 * alternative models if the primary errors (e.g. 503 high demand).
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Hard ceiling on how long we wait for the AI provider before giving up and
// falling back. Prevents a hung request from stalling the whole workflow.
const AI_TIMEOUT_MS = 25_000;

export interface GenerateResult {
  text: string;
  model: string;
}

/**
 * Generate text with the primary model, transparently falling back to
 * alternative models if the primary errors (e.g. 503 high demand), and
 * reports which model actually produced the text.
 */
export async function generateTextWithModel(
  prompt: string,
  system = "You are a helpful assistant.",
): Promise<GenerateResult> {
  const models = [AI_MODEL, ...FALLBACK_MODELS];
  let lastErr: unknown;
  for (const model of models) {
    // Retry transient overloads (503) / rate limits (429) with backoff.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.chat.completions.create(
          {
            model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
            temperature: 1.0,
            top_p: 1.0,
            max_tokens: 1000,
          },
          { timeout: AI_TIMEOUT_MS },
        );
        const text = response.choices[0]?.message?.content?.trim();
        if (text) return { text, model };
      } catch (err) {
        lastErr = err;
        const status = (err as { status?: number })?.status;
        const transient = status === 503 || status === 429;
        console.error(
          `AI model ${model} attempt ${attempt + 1} failed (status ${status}).`,
        );
        if (transient && attempt === 0) {
          await sleep(900);
          continue;
        }
        break;
      }
    }
  }
  throw lastErr ?? new Error("All AI models failed");
}

export async function generateText(prompt: string): Promise<string> {
  const { text } = await generateTextWithModel(prompt);
  return text;
}

/**
 * Analyse a complaint and assign a triage priority/score.
 */
export async function analyseComplaintWithAI(
  title: string,
  category: string,
  description: string,
): Promise<AIAnalysis> {
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

  const raw = await generateText(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return {
    aiPriority: parsed.priority,
    aiExplanation: parsed.explanation,
    aiScore: parsed.score,
  };
}

/**
 * Generate a professional reply to a complaint.
 */
export async function generateComplaintReply(complaint: {
  title: string;
  category: string;
  description: string;
  priority: string;
  aiExplanation?: string | null;
  automated?: boolean;
}): Promise<string> {
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
${complaint.automated ? "- Mentions that this is an initial automated response and a staff member will follow up if needed" : ""}

Return ONLY the reply text, no preamble, no labels, no quotes.
`;

  return generateText(prompt);
}

/**
 * Generate the automatic acknowledgement response sent to the student
 * immediately after a complaint is submitted. Returns both the response
 * text and the model that produced it (for audit/storage).
 */
export async function generateComplaintAcknowledgement(complaint: {
  title: string;
  category: string;
  description: string;
}): Promise<GenerateResult> {
  const system =
    "You are a professional, empathetic student affairs officer at a university. " +
    "You write brief acknowledgement messages confirming receipt of student complaints.";

  const prompt = `
A student has just submitted the following complaint to the Students Welfare Office.

Complaint Title: "${complaint.title}"
Category: "${complaint.category}"
Description: "${complaint.description}"

Write a short acknowledgement message to the student that:
- Acknowledges their complaint warmly and professionally
- Confirms that the issue has been received and logged
- Provides genuinely useful, general guidance where appropriate
- Encourages the student to wait for the administrator's review

Strict rules:
- NEVER invent or cite specific university policies, names, offices, deadlines, or figures
- NEVER promise any action, outcome, or timeline that has not actually happened
- Do NOT claim the issue is resolved
- Keep it concise (3-5 sentences), warm, and professional

Return ONLY the message text — no preamble, no labels, no quotes, no signature block.
`;

  return generateTextWithModel(prompt, system);
}

/**
 * Generate a complaint description from a title + category (student helper).
 */
export async function generateComplaintDescription(
  title: string,
  category: string,
): Promise<string> {
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

  return generateText(prompt);
}
