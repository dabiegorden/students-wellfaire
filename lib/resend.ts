import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "support@jssolutionshub.com";
const APP_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ComplaintLike {
  _id: string;
  title: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  studentName: string;
  studentEmail: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrapTemplate(title: string, bodyHtml: string) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
    <h2 style="color: #111827;">${title}</h2>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">
      Students Wellfaire Portal &mdash; this is an automated notification.
    </p>
  </div>`;
}

/**
 * Notify all admins via email when a student submits a new complaint.
 */
export async function sendNewComplaintNotificationToAdmins(
  complaint: ComplaintLike,
  adminEmails: string[],
) {
  if (adminEmails.length === 0) return;

  const bodyHtml = `
    <p>A new complaint has been submitted and requires your attention.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 6px 0; font-weight: bold; width: 120px;">Student:</td><td>${escapeHtml(complaint.studentName)} (${escapeHtml(complaint.studentEmail)})</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold;">Title:</td><td>${escapeHtml(complaint.title)}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold;">Category:</td><td>${escapeHtml(complaint.category)}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold;">Priority:</td><td>${escapeHtml(complaint.priority)}</td></tr>
    </table>
    <p style="white-space: pre-wrap; background: #f3f4f6; padding: 12px; border-radius: 6px;">${escapeHtml(complaint.description)}</p>
    <p>If a complaint isn't reviewed by an admin within a few minutes, our AI assistant will automatically send the student an initial response.</p>
    <p><a href="${APP_URL}/admin/complaints/${complaint._id}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">View Complaint</a></p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `New Complaint: ${complaint.title}`,
      html: wrapTemplate("New Student Complaint Submitted", bodyHtml),
    });

    if (error) {
      console.error("Failed to send admin notification email:", error);
    }
  } catch (err) {
    console.error("Error sending admin notification email:", err);
  }
}

/**
 * Notify the student via email when their complaint receives a reply
 * (either from an admin or the AI assistant).
 */
export async function sendComplaintReplyNotificationToStudent(
  complaint: ComplaintLike,
  reply: string,
  repliedBy: "admin" | "ai",
) {
  if (!complaint.studentEmail) return;

  const replySourceLabel =
    repliedBy === "ai"
      ? "Automated Assistant (on behalf of the Students Affairs Office)"
      : "Students Affairs Office";

  const bodyHtml = `
    <p>Hi ${escapeHtml(complaint.studentName)},</p>
    <p>You have received a reply to your complaint <strong>"${escapeHtml(complaint.title)}"</strong>.</p>
    <p style="white-space: pre-wrap; background: #f3f4f6; padding: 12px; border-radius: 6px;">${escapeHtml(reply)}</p>
    <p style="font-size: 13px; color: #6b7280;">Replied by: ${replySourceLabel}</p>
    ${
      repliedBy === "ai"
        ? `<p style="font-size: 13px; color: #6b7280;">This is an initial automated response. An admin will follow up with you shortly if further action is needed.</p>`
        : ""
    }
    <p><a href="${APP_URL}/student/complaints/${complaint._id}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">View Complaint</a></p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: complaint.studentEmail,
      subject: `Reply to your complaint: ${complaint.title}`,
      html: wrapTemplate("You Have a New Reply", bodyHtml),
    });

    if (error) {
      console.error("Failed to send student reply notification email:", error);
    }
  } catch (err) {
    console.error("Error sending student reply notification email:", err);
  }
}
