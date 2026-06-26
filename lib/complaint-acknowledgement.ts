import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/src/db";
import { complaints } from "@/src/schema";
import {
  analyseComplaintWithAI,
  generateComplaintAcknowledgement,
} from "@/lib/ai";
import { sendComplaintAcknowledgementToStudent } from "@/lib/resend";

/**
 * End-to-end async workflow that runs immediately after a complaint is
 * created. It is intentionally fault-tolerant: each stage (AI triage, AI
 * acknowledgement, email, persistence) is isolated so a failure in one never
 * blocks the others, and the student always receives an email.
 *
 * Duplicate / race protection: the first thing we do is *atomically claim*
 * the complaint by flipping `processingStatus` to "processing" only if it
 * has not already been claimed. If another invocation already claimed it,
 * this one exits without generating a second AI response or sending a second
 * email.
 */
export async function processComplaintAcknowledgement(
  complaintId: string,
): Promise<void> {
  console.log(`[ack] Starting acknowledgement workflow for ${complaintId}...`);

  // ── Stage 0: atomically claim the complaint ──────────────────────────
  let claimed;
  try {
    [claimed] = await db
      .update(complaints)
      .set({ processingStatus: "processing", updatedAt: new Date() })
      .where(
        and(
          eq(complaints.id, complaintId),
          // Only claim if not already claimed/completed.
          or(
            isNull(complaints.processingStatus),
            eq(complaints.processingStatus, "pending"),
            eq(complaints.processingStatus, "failed"),
          ),
        ),
      )
      .returning();
  } catch (err) {
    console.error(`[ack] Failed to claim ${complaintId}:`, err);
    return;
  }

  if (!claimed) {
    console.log(
      `[ack] ${complaintId} already claimed/completed — skipping (duplicate prevented).`,
    );
    return;
  }

  const complaint = claimed;

  // ── Stage 1: AI triage (priority). Non-blocking on failure. ──────────
  try {
    console.log(`[ack] Generating AI triage for ${complaintId}...`);
    const triage = await analyseComplaintWithAI(
      complaint.title,
      complaint.category,
      complaint.description,
    );
    await db
      .update(complaints)
      .set({
        priority: triage.aiPriority,
        aiPriority: triage.aiPriority,
        aiExplanation: triage.aiExplanation,
        aiScore: triage.aiScore,
        aiAnalysedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, complaintId));
    console.log(`[ack] AI triage stored for ${complaintId}.`);
  } catch (err) {
    // Keep the default "Medium" priority; do not abort the workflow.
    console.error(`[ack] AI triage failed for ${complaintId}:`, err);
  }

  // ── Stage 2: AI acknowledgement response. Falls back to template. ────
  let aiResponse: string | null = null;
  let aiModel: string | null = null;
  try {
    console.log(`[ack] Generating AI acknowledgement for ${complaintId}...`);
    const result = await generateComplaintAcknowledgement({
      title: complaint.title,
      category: complaint.category,
      description: complaint.description,
    });
    aiResponse = result.text;
    aiModel = result.model;

    await db
      .update(complaints)
      .set({
        aiResponse,
        aiModel,
        aiGeneratedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, complaintId));
    console.log(`[ack] AI acknowledgement stored for ${complaintId}.`);
  } catch (err) {
    console.error(
      `[ack] AI acknowledgement failed for ${complaintId} — using fallback email:`,
      err,
    );
  }

  // ── Stage 3: send email (AI response or fallback). ───────────────────
  let emailStatus: "sent" | "failed" = "failed";
  try {
    console.log(`[ack] Sending acknowledgement email for ${complaintId}...`);
    emailStatus = await sendComplaintAcknowledgementToStudent(
      {
        _id: complaint.id,
        title: complaint.title,
        studentName: complaint.studentName,
        studentEmail: complaint.studentEmail,
      },
      aiResponse,
    );
  } catch (err) {
    console.error(`[ack] Email stage threw for ${complaintId}:`, err);
  }

  // ── Stage 4: persist final state. ────────────────────────────────────
  try {
    await db
      .update(complaints)
      .set({
        emailSent: emailStatus === "sent",
        emailSentAt: emailStatus === "sent" ? new Date() : null,
        emailStatus,
        processingStatus: "completed",
        processingError: null,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, complaintId));
  } catch (err) {
    console.error(`[ack] Failed to persist final state for ${complaintId}:`, err);
  }

  console.log(
    `[ack] Workflow complete for ${complaintId} (email=${emailStatus}, ai=${aiResponse ? "ok" : "fallback"}).`,
  );
}
