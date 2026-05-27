"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Megaphone,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Mail,
  MailCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  Bot,
  RefreshCw,
  Eye,
} from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  category:
    | "General"
    | "Academic"
    | "Events"
    | "Emergency"
    | "Welfare"
    | "Other";
  content: string;
  authorName: string;
  isPinned: boolean;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "General",
  "Academic",
  "Events",
  "Emergency",
  "Welfare",
  "Other",
] as const;

const categoryColors: Record<string, string> = {
  General: "#3b82f6",
  Academic: "#8b5cf6",
  Events: "#10b981",
  Emergency: "#ef4444",
  Welfare: "#f59e0b",
  Other: "#6b7280",
};

const categoryStyles: Record<string, string> = {
  General: "bg-blue-400/10 text-blue-400 border-blue-400/25",
  Academic: "bg-violet-400/10 text-violet-400 border-violet-400/25",
  Events: "bg-emerald-400/10 text-emerald-400 border-emerald-400/25",
  Emergency: "bg-red-400/10 text-red-400 border-red-400/25",
  Welfare: "bg-amber-400/10 text-amber-400 border-amber-400/25",
  Other: "bg-zinc-400/10 text-zinc-400 border-zinc-400/25",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
        categoryStyles[category] ?? categoryStyles.Other
      }`}
    >
      {category}
    </span>
  );
}

// ── Create / Edit Modal ────────────────────────────────────────────
function AnnouncementModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: Announcement;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    category: initial?.category ?? "General",
    content: initial?.content ?? "",
    isPinned: initial?.isPinned ?? false,
    sendEmail: false,
    resendEmail: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!form.title || !form.category) {
      setError("Enter a title and select a category before generating.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/announcements/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: form.title, category: form.category }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm((p) => ({ ...p, content: data.content }));
      setAiUsed(true);
      setTimeout(() => contentRef.current?.focus(), 100);
    } catch {
      setError("Couldn't generate content. Write it manually.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.content) {
      setError("Title, category, and content are required.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        mode === "create"
          ? "/api/announcements"
          : `/api/announcements/${initial?._id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const body =
        mode === "create"
          ? {
              title: form.title,
              category: form.category,
              content: form.content,
              isPinned: form.isPinned,
              sendEmail: form.sendEmail,
            }
          : {
              title: form.title,
              category: form.category,
              content: form.content,
              isPinned: form.isPinned,
              resendEmail: form.resendEmail,
            };

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setShowSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 700);
    } catch {
      setError("Failed to save announcement.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const color = categoryColors[form.category] ?? "#10b981";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto relative"
      >
        {/* Success overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-white font-semibold text-lg">
                  {mode === "create"
                    ? "Announcement Created!"
                    : "Changes Saved!"}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800 rounded-t-2xl"
          style={{
            background: `linear-gradient(135deg, ${color}11, #18181b)`,
            borderBottom: `1px solid ${color}22`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{
                backgroundColor: `${color}22`,
                border: `1px solid ${color}44`,
              }}
            >
              📢
            </div>
            <h2 className="text-base font-semibold text-white">
              {mode === "create" ? "New Announcement" : "Edit Announcement"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1.5 block">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Announcement title…"
              className="w-full px-4 py-2.5 bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/50 rounded-xl text-white placeholder:text-zinc-600 outline-none text-sm transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1.5 block">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value as any }))
              }
              className="w-full px-4 py-2.5 bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/50 text-white rounded-xl text-sm outline-none appearance-none cursor-pointer transition-all"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-zinc-400 font-medium">
                Content <span className="text-red-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40 bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    AI Draft
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <textarea
                ref={contentRef}
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                rows={6}
                placeholder="Write your announcement content here…"
                className="w-full px-4 py-3 bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/50 rounded-xl text-white placeholder:text-zinc-600 outline-none text-sm resize-none transition-all"
              />
              <AnimatePresence>
                {aiUsed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-emerald-400/70 bg-emerald-400/5 border border-emerald-400/20 rounded-md px-2 py-1"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    AI-drafted · edit freely
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {/* Pin toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() =>
                  setForm((p) => ({ ...p, isPinned: !p.isPinned }))
                }
                className={`w-9 h-5 rounded-full transition-all relative ${
                  form.isPinned ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.isPinned ? "translate-x-4" : ""
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-zinc-300 font-medium">
                  Pin announcement
                </p>
                <p className="text-xs text-zinc-600">
                  Pinned announcements always appear at the top
                </p>
              </div>
            </label>

            {/* Email toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() =>
                  setForm((p) =>
                    mode === "create"
                      ? { ...p, sendEmail: !p.sendEmail }
                      : { ...p, resendEmail: !p.resendEmail },
                  )
                }
                className={`w-9 h-5 rounded-full transition-all relative ${
                  (mode === "create" ? form.sendEmail : form.resendEmail)
                    ? "bg-emerald-500"
                    : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    (mode === "create" ? form.sendEmail : form.resendEmail)
                      ? "translate-x-4"
                      : ""
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-zinc-300 font-medium">
                  {mode === "create"
                    ? "Email all students"
                    : "Re-send email to all students"}
                </p>
                <p className="text-xs text-zinc-600">
                  {mode === "create"
                    ? "Send an email notification to every registered student"
                    : "Notify all students about the updated announcement"}
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {mode === "create" ? "Post Announcement" : "Save Changes"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Preview Modal ──────────────────────────────────────────────────
function PreviewModal({
  announcement,
  onClose,
  onEdit,
  onDelete,
}: {
  announcement: Announcement;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color = categoryColors[announcement.category] ?? "#10b981";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full max-h-[88vh] overflow-y-auto"
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{
            background: `linear-gradient(135deg, ${color}18, transparent)`,
            borderBottomColor: `${color}22`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CategoryBadge category={announcement.category} />
                {announcement.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-amber-400/10 text-amber-400 border-amber-400/25">
                    <Pin className="w-2.5 h-2.5" />
                    Pinned
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white leading-snug">
                {announcement.title}
              </h2>
              <p className="text-xs text-zinc-500 mt-1.5">
                Posted by {announcement.authorName} ·{" "}
                {new Date(announcement.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
            {announcement.content}
          </p>

          {announcement.emailSent && (
            <div className="flex items-center gap-2 text-emerald-400/80 text-xs bg-emerald-400/5 border border-emerald-400/15 rounded-lg px-3 py-2">
              <MailCheck className="w-3.5 h-3.5" />
              Emailed to all students on{" "}
              {new Date(announcement.emailSentAt!).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium rounded-xl transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-sm font-medium rounded-xl transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AdminAnnouncementPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Announcement | null>(null);

  // Auth
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

  useEffect(() => {
    if (user) fetchAnnouncements();
  }, [page, search, categoryFilter, user]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        category: categoryFilter,
      });
      const res = await fetch(`/api/announcements?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch announcements");
      const data = await res.json();
      setAnnouncements(data.announcements);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setSuccess("Announcement deleted successfully");
      setPreviewTarget(null);
      fetchAnnouncements();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete announcement");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-150 h-75 rounded-full bg-emerald-500/3 blur-[120px]" />
      </div>

      <main className="relative z-10 pt-24 pb-16 px-6">
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
                  <div className="w-6 h-0.5 bg-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                    Admin Dashboard
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Announcements
                </h1>
                <p className="text-zinc-500 text-sm">
                  {total} announcement{total !== 1 ? "s" : ""} · Broadcast to
                  all students
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                New Announcement
              </motion.button>
            </div>
          </motion.div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm"
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
                className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm"
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
            className="mb-5 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-300">
                Filters
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                <input
                  placeholder="Search announcements…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 h-9 bg-zinc-800/60 border border-zinc-700/60 focus:border-emerald-500/40 text-white placeholder:text-zinc-600 rounded-lg text-sm outline-none transition-all"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3 bg-zinc-800/60 border border-zinc-700/60 focus:border-emerald-500/40 text-white rounded-lg text-sm outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
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
            className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center p-16">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center p-16">
                <Megaphone className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No announcements yet</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 text-emerald-400 text-sm hover:underline"
                >
                  Create the first one →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/60 border-b border-zinc-700/60">
                    <tr>
                      {[
                        "Title",
                        "Category",
                        "Author",
                        "Emailed",
                        "Pinned",
                        "Date",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {announcements.map((a) => {
                      const color = categoryColors[a.category] ?? "#6b7280";
                      return (
                        <tr
                          key={a._id}
                          className="hover:bg-zinc-800/30 transition-colors group"
                        >
                          <td className="px-5 py-4 max-w-64">
                            <div className="flex items-center gap-2">
                              {a.isPinned && (
                                <Pin
                                  className="w-3 h-3 shrink-0"
                                  style={{ color }}
                                />
                              )}
                              <p className="text-white text-sm font-medium truncate">
                                {a.title}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <CategoryBadge category={a.category} />
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-zinc-400 text-sm">
                              {a.authorName}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {a.emailSent ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                                <MailCheck className="w-3.5 h-3.5" />
                                Sent
                              </span>
                            ) : (
                              <span className="text-zinc-700 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {a.isPinned ? (
                              <span className="text-amber-400 text-xs">
                                Yes
                              </span>
                            ) : (
                              <span className="text-zinc-700 text-xs">No</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-zinc-500 text-xs">
                              {new Date(a.createdAt).toLocaleDateString(
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
                                onClick={() => setPreviewTarget(a)}
                                className="p-1.5 rounded-lg bg-zinc-700/50 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditTarget(a)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(a._id)}
                                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800/60 bg-zinc-900/40">
                <span className="text-xs text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <AnnouncementModal
            mode="create"
            onClose={() => setShowCreate(false)}
            onSaved={() => {
              fetchAnnouncements();
              setSuccess("Announcement created successfully");
              setTimeout(() => setSuccess(""), 3000);
            }}
          />
        )}
        {editTarget && (
          <AnnouncementModal
            mode="edit"
            initial={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={() => {
              fetchAnnouncements();
              setEditTarget(null);
              setSuccess("Announcement updated successfully");
              setTimeout(() => setSuccess(""), 3000);
            }}
          />
        )}
        {previewTarget && (
          <PreviewModal
            announcement={previewTarget}
            onClose={() => setPreviewTarget(null)}
            onEdit={() => {
              setEditTarget(previewTarget);
              setPreviewTarget(null);
            }}
            onDelete={() => handleDelete(previewTarget._id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
