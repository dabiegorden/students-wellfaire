import type { Server as SocketIOServer, Socket } from "socket.io";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

interface AuthedSocket extends Socket {
  data: {
    userId: string;
    role: "students" | "admin";
  };
}

// Tracks userId -> set of connected socket ids (in-memory presence)
const onlineUsers = new Map<string, Set<string>>();
// Tracks online admin userIds (for student-facing "support online" indicator)
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
        (socket.handshake.headers?.authorization || "").replace(
          "Bearer ",
          "",
        );

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error("Unauthorized"));
      }

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
    if (role === "admin") {
      socket.join(ADMIN_ROOM);
    }

    // Mark user online
    const wasOffline = !onlineUsers.has(userId);
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    if (wasOffline) {
      io.emit("presence:update", { userId, online: true });
    }

    if (role === "admin") {
      const wasAdminOffline = onlineAdmins.size === 0;
      onlineAdmins.add(userId);
      if (wasAdminOffline) {
        io.emit("presence:admin-status", { online: true });
      }
    }

    // Send the requester the current online list
    socket.emit("presence:online-users", Array.from(onlineUsers.keys()));
    socket.emit("presence:admin-status", { online: onlineAdmins.size > 0 });

    // ---- Send a message ----
    socket.on(
      "message:send",
      async (
        payload: { conversationId?: string; content: string },
        ack?: (response: any) => void,
      ) => {
        try {
          const content = (payload.content || "").trim();
          if (!content) {
            return ack?.({ error: "Message cannot be empty" });
          }

          await connectDB();

          let conversation;

          if (role === "students") {
            conversation = await Conversation.findOne({ student: userId });
            if (!conversation) {
              conversation = await Conversation.create({ student: userId });
            }
          } else {
            if (!payload.conversationId) {
              return ack?.({ error: "conversationId is required" });
            }
            conversation = await Conversation.findById(
              payload.conversationId,
            );
            if (!conversation) {
              return ack?.({ error: "Conversation not found" });
            }
          }

          const message = await Message.create({
            conversation: conversation._id,
            sender: userId,
            senderRole: role,
            content,
          });

          conversation.lastMessage = content;
          conversation.lastMessageAt = new Date();
          conversation.lastMessageSender = role;
          if (role === "students") {
            conversation.adminUnreadCount =
              (conversation.adminUnreadCount || 0) + 1;
          } else {
            conversation.studentUnreadCount =
              (conversation.studentUnreadCount || 0) + 1;
          }
          await conversation.save();

          const messagePayload = {
            _id: message._id.toString(),
            conversation: conversation._id.toString(),
            sender: userId,
            senderRole: role,
            content,
            createdAt: message.createdAt,
            readAt: null,
          };

          // Notify the student
          io.to(userRoom(conversation.student.toString())).emit(
            "message:new",
            messagePayload,
          );
          // Notify all admins
          io.to(ADMIN_ROOM).emit("message:new", messagePayload);

          ack?.({ message: messagePayload });
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

    // Join a specific conversation room (used for typing indicators)
    socket.on("conversation:join", (conversationId: string) => {
      if (conversationId) socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId: string) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    // ---- Mark messages as read ----
    socket.on(
      "message:read",
      async (payload: { conversationId: string }) => {
        try {
          if (!payload?.conversationId) return;
          await connectDB();

          const conversation = await Conversation.findById(
            payload.conversationId,
          );
          if (!conversation) return;

          const otherRole = role === "students" ? "admin" : "students";

          await Message.updateMany(
            {
              conversation: conversation._id,
              senderRole: otherRole,
              readAt: null,
            },
            { $set: { readAt: new Date() } },
          );

          if (role === "students") {
            conversation.studentUnreadCount = 0;
          } else {
            conversation.adminUnreadCount = 0;
          }
          await conversation.save();

          io.to(userRoom(conversation.student.toString())).emit(
            "message:read",
            { conversationId: conversation._id.toString(), reader: role },
          );
          io.to(ADMIN_ROOM).emit("message:read", {
            conversationId: conversation._id.toString(),
            reader: role,
          });
        } catch (err) {
          console.error("message:read error", err);
        }
      },
    );

    // ---- Disconnect / presence ----
    socket.on("disconnect", async () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);

          const lastSeen = new Date();
          try {
            await connectDB();
            await User.findByIdAndUpdate(userId, { lastSeen });
          } catch (err) {
            console.error("Failed to update lastSeen", err);
          }

          io.emit("presence:update", {
            userId,
            online: false,
            lastSeen,
          });

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
