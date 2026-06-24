"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Hand,
  Clock,
  CheckCircle2,
  Loader2,
  PlusCircle,
  MessageSquare,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  Resolved: "bg-cug-green/10 text-cug-green",
  Closed: "bg-muted text-muted-foreground",
};

export default function StudentsDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/complaints?limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setComplaints(data.complaints || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter(
      (c) => c.status === "Resolved" || c.status === "Closed",
    ).length,
  };

  const cards = [
    { label: "Total Complaints", value: stats.total, icon: Hand, color: "text-cug-green" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-500" },
    { label: "In Progress", value: stats.inProgress, icon: Loader2, color: "text-blue-500" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-cug-green" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome to your dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Track your complaints and stay connected with Students Affairs.
          </p>
        </div>
        <Link href="/students-dashboard/complaints/new">
          <Button>
            <PlusCircle className="mr-1 h-4 w-4" /> New Complaint
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="mt-2 text-3xl font-black text-foreground">
              {loading ? "—" : c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-foreground">Recent Complaints</h3>
            <Link
              href="/students-dashboard/complaints"
              className="text-sm font-semibold text-cug-green hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : complaints.length === 0 ? (
            <div className="py-10 text-center">
              <Hand className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                You haven&apos;t submitted any complaints yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {complaints.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.category}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[c.status] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <Link
            href="/students-dashboard/messages"
            className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-cug-green"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cug-green/10 text-cug-green">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Support Chat</p>
                <p className="text-xs text-muted-foreground">
                  Message the office
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            href="/students-dashboard/announcements"
            className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-cug-green"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cug-gold/15 text-cug-gold">
                <Megaphone className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Announcements</p>
                <p className="text-xs text-muted-foreground">Latest notices</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}
