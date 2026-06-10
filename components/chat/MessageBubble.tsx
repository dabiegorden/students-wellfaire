"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: string;
  senderRole: "students" | "admin";
  content: string;
  createdAt: string;
  readAt: string | null;
}

export function MessageBubble({
  message,
  isOwn,
}: {
  message: ChatMessage;
  isOwn: boolean;
}) {
  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 shadow-md",
          isOwn
            ? "bg-linear-to-br from-emerald-400 to-teal-600 text-zinc-950 rounded-br-sm"
            : "bg-zinc-800 text-zinc-100 rounded-bl-sm",
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10px]",
            isOwn ? "text-zinc-900/70 justify-end" : "text-zinc-400",
          )}
        >
          <span>{format(new Date(message.createdAt), "HH:mm")}</span>
          {isOwn &&
            (message.readAt ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            ))}
        </div>
      </div>
    </div>
  );
}
