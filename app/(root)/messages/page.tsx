"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useUser } from "@/context/user-context";

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role === "admin") {
      router.push("/admin-dashboard/messages");
      return;
    }

    setChecked(true);
  }, [user, isLoading, router]);

  if (isLoading || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative h-10 w-10 animate-spin rounded-full border-4 border-border border-t-cug-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-6 pb-12 px-4 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Chat with the Student Wellfare support team in real time.
          </p>
        </div>
        <ChatInterface />
      </div>
    </div>
  );
}
