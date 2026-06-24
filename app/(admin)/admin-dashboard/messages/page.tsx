"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Chat with students in real time.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
