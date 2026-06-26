"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  X,
  Bot,
  RefreshCw,
  Gauge,
  MessageSquare,
  Info,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AIAnalysis {
  aiPriority?: "Low" | "Medium" | "High" | "Critical";
  aiExplanation?: string;
  aiScore?: number;
  aiAnalysedAt?: string;
}

interface Complaint extends AIAnalysis {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
  };
  studentName: string;
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
  aiResponse?: string;
  aiGeneratedAt?: string;
  aiModel?: string;
  emailSent?: boolean;
  emailStatus?: string;
  emailSentAt?: string;
  processingStatus?: string;
}

const categories = [
  "Academic",
  "Welfare",
  "Accommodation",
  "Finance",
  "Health",
  "Other",
];
const statuses = ["Pending", "In Progress", "Resolved", "Closed"];

// ── Score arc SVG ──────────────────────────────────────────────────
function ScoreArc({ score }: { score: number }) {
  const radius = 30;
  const circumference = Math.PI * radius; // half circle
  const progress = (score / 100) * circumference;

  const color =
    score >= 75
      ? "#ef4444"
      : score >= 50
        ? "#f97316"
        : score >= 25
          ? "#eab308"
          : "#22c55e";

  return (
    <svg width="80" height="48" viewBox="0 0 80 48">
      {/* Track */}
      <path
        d="M 8 44 A 32 32 0 0 1 72 44"
        fill="none"
        stroke="#27272a"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Progress */}
      <path
        d="M 8 44 A 32 32 0 0 1 72 44"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={`${circumference - progress}`}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x="40"
        y="42"
        textAnchor="middle"
        fill={color}
        fontSize="13"
        fontWeight="700"
      >
        {score}
      </text>
    </svg>
  );
}

// ── Colour helpers ─────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/25",
  "In Progress": "bg-blue-400/10 text-blue-400 border-blue-400/25",
  Resolved: "bg-cug-green/10 text-cug-green border-cug-green/25",
  Closed: "bg-muted text-muted-foreground border-border/25",
};

const priorityStyles: Record<string, string> = {
  Low: "bg-cug-green/10 text-cug-green border-cug-green/25",
  Medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/25",
  High: "bg-orange-400/10 text-orange-400 border-orange-400/25",
  Critical: "bg-red-400/10 text-destructive border-destructive/40/25",
};

function Badge({
  label,
  styles,
  prefix,
}: {
  label: string;
  styles: Record<string, string>;
  prefix?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${styles[label] ?? "bg-muted text-muted-foreground border-border/25"}`}
    >
      {prefix && <span className="opacity-60">{prefix}</span>}
      {label}
    </span>
  );
}

// ── AI Panel inside modal ──────────────────────────────────────────
function AIPanel({
  complaint,
  onReanalyse,
  isReanalysing,
}: {
  complaint: Complaint;
  onReanalyse: () => void;
  isReanalysing: boolean;
}) {
  const [open, setOpen] = useState(true);
  const hasAI = complaint.aiPriority !== undefined;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cug-green" />
          <span className="text-sm font-semibold text-foreground">AI Analysis</span>
          {hasAI && (
            <span className="text-[10px] text-muted-foreground">
              · {new Date(complaint.aiAnalysedAt!).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReanalyse();
            }}
            disabled={isReanalysing}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-cug-green/10 border border-cug-green/25 text-cug-green hover:bg-cug-green/20 transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 ${isReanalysing ? "animate-spin" : ""}`}
            />
            Re-analyse
          </button>

          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 bg-background/60 border-t border-border">
              {!hasAI ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                  <Info className="w-4 h-4" />
                  No AI analysis yet. Click Re-analyse to run it.
                </div>
              ) : (
                <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 items-start">
                  {/* Score */}
                  <div className="flex flex-col items-center gap-1">
                    <ScoreArc score={complaint.aiScore!} />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Urgency Score
                    </span>
                  </div>

                  {/* Priority + Explanation */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                        AI-Assigned Priority
                      </p>
                      <Badge
                        label={complaint.aiPriority!}
                        styles={priorityStyles}
                        prefix="AI:"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                        Reasoning
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {complaint.aiExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AdminComplaintsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [formData, setFormData] = useState({
    adminReply: "",
    status: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReanalysing, setIsReanalysing] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [aiReplyUsed, setAiReplyUsed] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  // ── Auth ──
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        if (data.user.role !== "admin") {
          router.push("/");
          return;
        }
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setIsLoadingAuth(false);
      }
    };
    fetchUser();
  }, [router]);

  // ── Fetch ──
  useEffect(() => {
    if (user) fetchComplaints();
  }, [page, search, statusFilter, categoryFilter, user]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status: statusFilter,
        category: categoryFilter,
      });

      const res = await fetch(`/api/complaints?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch complaints");

      const data = await res.json();
      setComplaints(data.complaints);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setFormData({
      adminReply: complaint.adminReply || "",
      status: complaint.status,
    });
    setAiReplyUsed(false);
    setShowSaveSuccess(false);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this complaint permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/complaints/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setSuccess("Complaint deleted successfully");
      fetchComplaints();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleGenerateReply = async () => {
    if (!selectedComplaint) return;

    setIsGeneratingReply(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/complaints/generate-reply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ complaintId: selectedComplaint._id }),
      });

      if (!res.ok) throw new Error("Failed to generate reply");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, adminReply: data.reply }));
      setAiReplyUsed(true);

      setTimeout(() => {
        replyRef.current?.focus();
      }, 100);
    } catch (err) {
      setError("Couldn't generate reply. Please write it manually.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();

      // Show success animation
      setShowSaveSuccess(true);
      setSelectedComplaint(data.complaint);
      setAiReplyUsed(false);

      // Refresh the list
      fetchComplaints();

      // Close modal after short delay to show success animation
      setTimeout(() => {
        setShowModal(false);
        setShowSaveSuccess(false);
        setSuccess("Complaint updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReanalyse = async () => {
    if (!selectedComplaint) return;
    setIsReanalysing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reanalyse: true }),
      });
      if (!res.ok) throw new Error("Re-analysis failed");
      const data = await res.json();
      setSelectedComplaint(data.complaint);
      fetchComplaints();
      setSuccess("AI re-analysis complete");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Re-analysis failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsReanalysing(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-cug-green" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-150 h-75 rounded-full bg-cug-green/3 blur-[120px]" />
      </div>

      <main className="relative z-10 pt-6 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-0.5 bg-cug-green" />
                  <span className="text-cug-green text-xs font-semibold tracking-[0.2em] uppercase">
                    Admin Dashboard
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  Complaints
                </h1>
                <p className="text-muted-foreground text-sm">
                  {total} total complaint{total !== 1 ? "s" : ""} · AI priority
                  assessment enabled
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cug-green/10 border border-cug-green/25 text-cug-green text-xs font-medium">
                <Bot className="w-3.5 h-3.5" />
                AI Active
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-destructive/10 border border-destructive/25 rounded-xl text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-cug-green/10 border border-cug-green/25 rounded-xl text-cug-green text-sm"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-5 bg-card/70 border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Filters
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search complaints…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 h-9 bg-muted/60 border border-border/60 focus:border-cug-green/40 text-foreground placeholder:text-muted-foreground rounded-lg text-sm outline-none transition-all"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3 bg-muted/60 border border-border/60 focus:border-cug-green/40 text-foreground rounded-lg text-sm outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3 bg-muted/60 border border-border/60 focus:border-cug-green/40 text-foreground rounded-lg text-sm outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/70 border border-border rounded-xl overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center p-16">
                <Loader2 className="w-7 h-7 animate-spin text-cug-green" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center p-16 text-muted-foreground text-sm">
                No complaints found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/60 border-b border-border/60">
                    <tr>
                      {[
                        "Title",
                        "Student",
                        "Category",
                        "Priority",
                        "AI Score",
                        "Status",
                        "Date",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {complaints.map((complaint) => (
                      <tr
                        key={complaint._id}
                        className="hover:bg-muted transition-colors group"
                      >
                        <td className="px-5 py-4 max-w-50">
                          <p className="text-foreground text-sm font-medium truncate">
                            {complaint.title}
                          </p>
                          {complaint.adminReply && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-cug-green/70 mt-0.5">
                              <MessageSquare className="w-2.5 h-2.5" />
                              Replied
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-foreground text-sm">
                            {complaint.student?.firstName}{" "}
                            {complaint.student?.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs truncate max-w-35">
                            {complaint.student?.email}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-muted-foreground text-sm">
                            {complaint.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge
                              label={complaint.priority}
                              styles={priorityStyles}
                            />
                            {complaint.aiPriority &&
                              complaint.aiPriority !== complaint.priority && (
                                <Badge
                                  label={complaint.aiPriority}
                                  styles={priorityStyles}
                                  prefix="AI:"
                                />
                              )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {complaint.aiScore !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${complaint.aiScore}%`,
                                    backgroundColor:
                                      complaint.aiScore >= 75
                                        ? "#ef4444"
                                        : complaint.aiScore >= 50
                                          ? "#f97316"
                                          : complaint.aiScore >= 25
                                            ? "#eab308"
                                            : "#22c55e",
                                  }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {complaint.aiScore}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            label={complaint.status}
                            styles={statusStyles}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-muted-foreground text-xs">
                            {new Date(complaint.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleView(complaint)}
                              className="p-1.5 rounded-lg bg-cug-green/10 border border-cug-green/25 text-cug-green hover:bg-cug-green/20 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(complaint._id)}
                              className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60 bg-card/40">
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-border disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {showModal && selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto relative"
            >
              {/* Success Overlay */}
              <AnimatePresence>
                {showSaveSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-card/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-full bg-cug-green/20 border-2 border-cug-green/40 flex items-center justify-center">
                        <Check className="w-8 h-8 text-cug-green" />
                      </div>
                      <p className="text-foreground font-semibold text-lg">
                        Changes Saved!
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card border-b border-border">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground leading-tight">
                      {selectedComplaint.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        label={selectedComplaint.status}
                        styles={statusStyles}
                      />
                      <Badge
                        label={selectedComplaint.priority}
                        styles={priorityStyles}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Student info */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Student</p>
                    <p className="text-foreground font-medium">
                      {selectedComplaint.student?.firstName}{" "}
                      {selectedComplaint.student?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="text-foreground">
                      {selectedComplaint.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                    <p className="text-foreground">
                      {new Date(selectedComplaint.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Description</p>
                  <p className="text-foreground text-sm leading-relaxed bg-background/50 rounded-xl px-4 py-3 border border-border">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* AI Panel */}
                <AIPanel
                  complaint={selectedComplaint}
                  onReanalyse={handleReanalyse}
                  isReanalysing={isReanalysing}
                />

                {/* AI auto-acknowledgement sent to the student */}
                {selectedComplaint.aiResponse && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Bot className="w-3 h-3 text-cug-green" />
                      AI Acknowledgement (sent to student)
                      {selectedComplaint.emailStatus && (
                        <span
                          className={`ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${
                            selectedComplaint.emailStatus === "sent"
                              ? "bg-cug-green/10 text-cug-green border-cug-green/25"
                              : "bg-destructive/10 text-destructive border-destructive/25"
                          }`}
                        >
                          {selectedComplaint.emailStatus === "sent" ? (
                            <Check className="w-2.5 h-2.5" />
                          ) : (
                            <AlertCircle className="w-2.5 h-2.5" />
                          )}
                          Email {selectedComplaint.emailStatus}
                        </span>
                      )}
                    </p>
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap bg-cug-green/5 rounded-xl px-4 py-3 border border-cug-green/15">
                      {selectedComplaint.aiResponse}
                    </p>
                    {selectedComplaint.aiModel && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Generated by {selectedComplaint.aiModel}
                        {selectedComplaint.aiGeneratedAt &&
                          ` · ${new Date(selectedComplaint.aiGeneratedAt).toLocaleString()}`}
                      </p>
                    )}
                  </div>
                )}

                {/* Previous reply */}
                {selectedComplaint.adminReply && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      Previous Reply
                    </p>
                    <p className="text-white text-sm leading-relaxed bg-cug-green/5 rounded-xl px-4 py-3 border border-cug-green/15">
                      {selectedComplaint.adminReply}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-muted-foreground font-medium">
                        Admin Reply
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateReply}
                        disabled={isGeneratingReply}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-cug-green/10 border-cug-green/30 text-cug-green hover:bg-cug-green/20 hover:border-cug-green/50"
                      >
                        {isGeneratingReply ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Draft Reply
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <textarea
                        ref={replyRef}
                        value={formData.adminReply}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            adminReply: e.target.value,
                          })
                        }
                        rows={4}
                        placeholder="Write your response to the student…"
                        className="w-full px-4 py-3 bg-background/70 border border-border hover:border-border focus:border-cug-green/50 rounded-xl text-foreground placeholder:text-muted-foreground outline-none text-sm resize-none transition-all"
                      />
                      <AnimatePresence>
                        {aiReplyUsed && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-cug-green/70 bg-cug-green/5 border border-cug-green/20 rounded-md px-2 py-1"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            AI-drafted · edit freely
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
                      Update Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-background/70 border border-border hover:border-border focus:border-cug-green/50 text-foreground rounded-xl text-sm outline-none appearance-none cursor-pointer transition-all"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cug-green hover:bg-cug-green-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-5 py-2.5 border border-border hover:border-border text-foreground hover:text-foreground text-sm font-medium rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
