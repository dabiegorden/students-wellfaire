"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export interface ConversationItem {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId?: string;
    lastSeen?: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSender?: "students" | "admin";
  studentUnreadCount: number;
  adminUnreadCount: number;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isOnline,
  search,
}: {
  conversations: ConversationItem[];
  selectedId: string | null;
  onSelect: (conversation: ConversationItem) => void;
  isOnline: (userId: string) => boolean;
  search: string;
}) {
  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const name = `${c.student?.firstName || ""} ${c.student?.lastName || ""}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      c.student?.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.student?.studentId?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
        No conversations found.
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {filtered.map((conversation) => {
        const student = conversation.student;
        if (!student) return null;
        const initials =
          `${student.firstName?.charAt(0) || ""}${student.lastName?.charAt(0) || ""}`.toUpperCase();
        const online = isOnline(student._id);

        return (
          <button
            key={conversation._id}
            onClick={() => onSelect(conversation)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border hover:bg-muted",
              selectedId === conversation._id && "bg-muted",
            )}
          >
            <div className="relative shrink-0">
              <Avatar className="h-11 w-11 border-2 border-linear-to-br from-cug-green to-cug-green-dark">
                <AvatarFallback className="bg-linear-to-br from-cug-green to-cug-green-dark text-foreground font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-border",
                  online ? "bg-cug-green" : "bg-muted",
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {student.firstName} {student.lastName}
                </p>
                {conversation.lastMessageAt && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="truncate text-xs text-muted-foreground">
                  {conversation.lastMessageSender === "admin" && "You: "}
                  {conversation.lastMessage || "No messages yet"}
                </p>
                {conversation.adminUnreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-cug-green to-cug-green-dark px-1.5 text-[10px] font-bold text-foreground">
                    {conversation.adminUnreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
