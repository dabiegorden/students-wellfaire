import { GoogleGenAI } from "@google/genai";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import { isAdminOnline } from "@/lib/socket-server";
import { sendComplaintReplyNotificationToStudent } from "@/lib/resend";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// How long to wait for an admin to respond before the AI assistant
// automatically replies to the student.
const AUTO_REPLY_DELAY_MS = 2 * 60 * 1000; // 2 minutes

async function generateAIReply(complaint: {
  title: string;
  category: string;
  description: string;
  priority: string;
  aiExplanation?: string;
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
- Mentions that this is an initial automated response and a staff member will follow up if needed

Return ONLY the reply text, no preamble, no labels, no quotes.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text?.trim() ?? "";
}

/**
 * Schedules an automated AI reply for a newly submitted complaint if no
 * admin is online. If an admin (or the AI) replies before the timer fires,
 * the auto-reply is skipped.
 */
export function scheduleAIAutoReply(complaintId: string) {
  setTimeout(async () => {
    try {
      await connectDB();

      const complaint = await Complaint.findById(complaintId);
      if (!complaint) return;

      // Skip if someone has already replied or an admin has come online
      // and is expected to handle it.
      if (complaint.adminReply || complaint.repliedAt) return;
      if (isAdminOnline()) return;

      const reply = await generateAIReply({
        title: complaint.title,
        category: complaint.category,
        description: complaint.description,
        priority: complaint.priority,
        aiExplanation: complaint.aiExplanation,
      });

      if (!reply) return;

      complaint.adminReply = reply;
      complaint.repliedAt = new Date();
      complaint.repliedBy = "ai";
      if (complaint.status === "Pending") {
        complaint.status = "In Progress";
      }
      await complaint.save();

      await sendComplaintReplyNotificationToStudent(
        {
          _id: complaint._id.toString(),
          title: complaint.title,
          category: complaint.category,
          description: complaint.description,
          priority: complaint.priority,
          status: complaint.status,
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
