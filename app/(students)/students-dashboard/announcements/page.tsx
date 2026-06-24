"use client";

import { useEffect, useState } from "react";
import { Megaphone, Pin, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  category: string;
  content: string;
  authorName: string;
  isPinned: boolean;
  createdAt: string;
}

const categoryStyles: Record<string, string> = {
  General: "bg-muted text-muted-foreground",
  Academic: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  Events: "bg-cug-green/10 text-cug-green",
  Emergency: "bg-destructive/10 text-destructive",
  Welfare: "bg-cug-gold/15 text-cug-gold",
  Other: "bg-muted text-muted-foreground",
};

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/announcements?limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
        <p className="text-sm text-muted-foreground">
          Official notices from the Students Affairs Office.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-cug-green" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No announcements yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                {a.isPinned && (
                  <Pin className="h-4 w-4 text-cug-gold" />
                )}
                <h3 className="text-lg font-bold text-foreground">{a.title}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    categoryStyles[a.category] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {a.category}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                {a.content}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                By {a.authorName} ·{" "}
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
