"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function StudentMessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Support Chat</h2>
        <p className="text-sm text-muted-foreground">
          Chat with the Students Affairs Office (Students Wellfare) in real time.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
