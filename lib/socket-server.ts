import type { Server as SocketIOServer, Socket } from "socket.io";
import { eq, and, isNull } from "drizzle-orm";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/src/db";
import { users, conversations, messages } from "@/src/schema";
import { scheduleChatAutoReply } from "@/lib/chat-auto-reply";

interface AuthedSocket extends Socket {
  data: {
    userId: string;
    role: "students" | "admin";
  };
}

const onlineUsers = new Map<string, Set<string>>();
const onlineAdmins = new Set<string>();

const ADMIN_ROOM = "admins";

function userRoom(userId: string) {
  return `user:${userId}`;
}

export function initSocket(io: SocketIOServer) {
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ||
        (socket.handshake.headers?.authorization || "").replace("Bearer ", "");

      if (!token) return next(new Error("Unauthorized"));

      const decoded = verifyToken(token);
      if (!decoded) return next(new Error("Unauthorized"));

      (socket as AuthedSocket).data.userId = decoded.userId;
      (socket as AuthedSocket).data.role = decoded.role;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const { userId, role } = (socket as AuthedSocket).data;

    socket.join(userRoom(userId));
    if (role === "admin") socket.join(ADMIN_ROOM);

    const wasOffline = !onlineUsers.has(userId);
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socket.id);

    if (wasOffline) io.emit("presence:update", { userId, online: true });

    if (role === "admin") {
      const wasAdminOffline = onlineAdmins.size === 0;
      onlineAdmins.add(userId);
      if (wasAdminOffline) io.emit("presence:admin-status", { online: true });
    }

    socket.emit("presence:online-users", Array.from(onlineUsers.keys()));
    socket.emit("presence:admin-status", { online: onlineAdmins.size > 0 });

    // Allow a client to re-request the current presence snapshot at any time
    // (e.g. when opening the chat page) to avoid stale online indicators.
    socket.on("presence:sync", () => {
      socket.emit("presence:online-users", Array.from(onlineUsers.keys()));
      socket.emit("presence:admin-status", { online: onlineAdmins.size > 0 });
    });

    // ---- Send a message ----
    socket.on(
      "message:send",
      async (
        payload: { conversationId?: string; content: string },
        ack?: (response: any) => void,
      ) => {
        try {
          const content = (payload.content || "").trim();
          if (!content) return ack?.({ error: "Message cannot be empty" });

          let conversation;

          if (role === "students") {
            [conversation] = await db
              .select()
              .from(conversations)
              .where(eq(conversations.student, userId))
              .limit(1);
            if (!conversation) {
              [conversation] = await db
                .insert(conversations)
                .values({ student: userId })
                .returning();
            }
          } else {
            if (!payload.conversationId) {
              return ack?.({ error: "conversationId is required" });
            }
            [conversation] = await db
              .select()
              .from(conversations)
              .where(eq(conversations.id, payload.conversationId))
              .limit(1);
            if (!conversation) {
              return ack?.({ error: "Conversation not found" });
            }
          }

          const [message] = await db
            .insert(messages)
            .values({
              conversation: conversation.id,
              sender: userId,
              senderRole: role,
              content,
            })
            .returning();

          await db
            .update(conversations)
            .set({
              lastMessage: content,
              lastMessageAt: new Date(),
              lastMessageSender: role,
              studentUnreadCount:
                role === "admin"
                  ? (conversation.studentUnreadCount || 0) + 1
                  : conversation.studentUnreadCount,
              adminUnreadCount:
                role === "students"
                  ? (conversation.adminUnreadCount || 0) + 1
                  : conversation.adminUnreadCount,
              updatedAt: new Date(),
            })
            .where(eq(conversations.id, conversation.id));

          const messagePayload = {
            _id: message.id,
            id: message.id,
            conversation: conversation.id,
            sender: userId,
            senderRole: role,
            content,
            createdAt: message.createdAt,
            readAt: null,
          };

          io.to(userRoom(conversation.student)).emit(
            "message:new",
            messagePayload,
          );
          io.to(ADMIN_ROOM).emit("message:new", messagePayload);

          ack?.({ message: messagePayload });

          // If a student messaged and no admin is online, the assistant
          // replies on the admin's behalf after a short delay.
          if (role === "students" && onlineAdmins.size === 0) {
            scheduleChatAutoReply(
              conversation.id,
              io,
              () => onlineAdmins.size > 0,
              ADMIN_ROOM,
              userRoom,
            );
          }
        } catch (err) {
          console.error("message:send error", err);
          ack?.({ error: "Failed to send message" });
        }
      },
    );

    // ---- Typing indicator ----
    socket.on(
      "typing",
      (payload: { conversationId: string; isTyping: boolean }) => {
        if (!payload?.conversationId) return;
        socket.to(`conversation:${payload.conversationId}`).emit("typing", {
          conversationId: payload.conversationId,
          userId,
          role,
          isTyping: !!payload.isTyping,
        });
        if (role === "students") {
          io.to(ADMIN_ROOM).emit("typing", {
            conversationId: payload.conversationId,
            userId,
            role,
            isTyping: !!payload.isTyping,
          });
        }
      },
    );

    socket.on("conversation:join", (conversationId: string) => {
      if (conversationId) socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId: string) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    // ---- Mark messages as read ----
    socket.on("message:read", async (payload: { conversationId: string }) => {
      try {
        if (!payload?.conversationId) return;

        const [conversation] = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, payload.conversationId))
          .limit(1);
        if (!conversation) return;

        const otherRole = role === "students" ? "admin" : "students";

        await db
          .update(messages)
          .set({ readAt: new Date() })
          .where(
            and(
              eq(messages.conversation, conversation.id),
              eq(messages.senderRole, otherRole),
              isNull(messages.readAt),
            ),
          );

        await db
          .update(conversations)
          .set(
            role === "students"
              ? { studentUnreadCount: 0 }
              : { adminUnreadCount: 0 },
          )
          .where(eq(conversations.id, conversation.id));

        io.to(userRoom(conversation.student)).emit("message:read", {
          conversationId: conversation.id,
          reader: role,
        });
        io.to(ADMIN_ROOM).emit("message:read", {
          conversationId: conversation.id,
          reader: role,
        });
      } catch (err) {
        console.error("message:read error", err);
      }
    });

    // ---- Disconnect / presence ----
    socket.on("disconnect", async () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          const lastSeen = new Date();
          try {
            await db
              .update(users)
              .set({ lastSeen })
              .where(eq(users.id, userId));
          } catch (err) {
            console.error("Failed to update lastSeen", err);
          }

          io.emit("presence:update", { userId, online: false, lastSeen });

          if (role === "admin") {
            onlineAdmins.delete(userId);
            if (onlineAdmins.size === 0) {
              io.emit("presence:admin-status", { online: false });
            }
          }
        }
      }
    });
  });
}

export function isUserOnline(userId: string) {
  return onlineUsers.has(userId);
}

export function isAdminOnline() {
  return onlineAdmins.size > 0;
}
