import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { complaints } from "@/src/schema";
import { sendComplaintReplyNotificationToStudent } from "@/lib/resend";
import { generateComplaintReply } from "@/lib/ai";

// How long to wait after a complaint is submitted before the AI assistant
// automatically replies to the student.
const AUTO_REPLY_DELAY_MS = 5 * 1000; // 5 seconds

/**
 * Schedules an automated AI reply for a newly submitted complaint. The reply
 * always fires after the delay, regardless of whether an admin is online. If
 * an admin (or the AI) has already replied before the timer fires, the
 * auto-reply is skipped to avoid overwriting an existing reply.
 */
export function scheduleAIAutoReply(complaintId: string) {
  setTimeout(async () => {
    try {
      const [complaint] = await db
        .select()
        .from(complaints)
        .where(eq(complaints.id, complaintId))
        .limit(1);

      if (!complaint) return;
      if (complaint.adminReply || complaint.repliedAt) return;

      const reply = await generateComplaintReply({
        title: complaint.title,
        category: complaint.category,
        description: complaint.description,
        priority: complaint.priority,
        aiExplanation: complaint.aiExplanation,
        automated: true,
      });

      if (!reply) return;

      const newStatus =
        complaint.status === "Pending" ? "In Progress" : complaint.status;

      await db
        .update(complaints)
        .set({
          adminReply: reply,
          repliedAt: new Date(),
          repliedBy: "ai",
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(complaints.id, complaintId));

      await sendComplaintReplyNotificationToStudent(
        {
          _id: complaint.id,
          title: complaint.title,
          category: complaint.category,
          description: complaint.description,
          priority: complaint.priority,
          status: newStatus,
          studentName: complaint.studentName,
          studentEmail: complaint.studentEmail,
        },
        reply,
        "ai",
      );
    } catch (err) {
      console.error("AI auto-reply failed:", err);
    }
  }, AUTO_REPLY_DELAY_MS);
}
