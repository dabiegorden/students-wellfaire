import { eq, desc } from "drizzle-orm";
import type { Server as SocketIOServer } from "socket.io";
import { db } from "@/src/db";
import { conversations, messages, users } from "@/src/schema";
import { generateText } from "@/lib/ai";

// Wait this long for an admin to reply before the assistant steps in.
const CHAT_AUTO_REPLY_DELAY_MS = 90 * 1000; // 90 seconds

async function getDefaultAdminId(): Promise<string | null> {
  const [admin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);
  return admin?.id ?? null;
}

async function generateChatReply(history: { senderRole: string; content: string }[]) {
  const transcript = history
    .map((m) => `${m.senderRole === "admin" ? "Officer" : "Student"}: ${m.content}`)
    .join("\n");

  const prompt = `
You are a friendly, professional student affairs officer at Catholic University of Ghana chatting with a student in real time. Based on the recent conversation, write a short, helpful reply (1-3 sentences) on behalf of the Students Affairs Office.

Conversation so far:
${transcript}

Write only the officer's next reply. Be warm, concise, and reassuring. If you cannot fully resolve the issue, acknowledge it and say a staff member will follow up shortly. Return ONLY the reply text.
`;

  return generateText(prompt);
}

/**
 * Schedule an automated reply on behalf of the admin if, after a short delay,
 * no admin is online and the admin hasn't already responded.
 */
export function scheduleChatAutoReply(
  conversationId: string,
  io: SocketIOServer,
  isAdminOnline: () => boolean,
  adminRoom: string,
  userRoom: (id: string) => string,
) {
  setTimeout(async () => {
    try {
      if (isAdminOnline()) return;

      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);
      if (!conversation) return;

      // If the most recent message is from an admin, no auto-reply needed.
      const recent = await db
        .select()
        .from(messages)
        .where(eq(messages.conversation, conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(8);

      if (!recent.length || recent[0].senderRole === "admin") return;

      const adminId = await getDefaultAdminId();
      if (!adminId) return;

      const ordered = [...recent].reverse();
      const reply = await generateChatReply(ordered);
      if (!reply) return;

      const [message] = await db
        .insert(messages)
        .values({
          conversation: conversationId,
          sender: adminId,
          senderRole: "admin",
          content: reply,
        })
        .returning();

      await db
        .update(conversations)
        .set({
          lastMessage: reply,
          lastMessageAt: new Date(),
          lastMessageSender: "admin",
          studentUnreadCount: (conversation.studentUnreadCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId));

      const payload = {
        _id: message.id,
        id: message.id,
        conversation: conversationId,
        sender: adminId,
        senderRole: "admin",
        content: reply,
        createdAt: message.createdAt,
        readAt: null,
        automated: true,
      };

      io.to(userRoom(conversation.student)).emit("message:new", payload);
      io.to(adminRoom).emit("message:new", payload);
    } catch (err) {
      console.error("Chat auto-reply failed:", err);
    }
  }, CHAT_AUTO_REPLY_DELAY_MS);
}
