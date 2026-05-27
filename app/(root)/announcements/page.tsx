"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Pin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Bell,
  Calendar,
  User,
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

const categoryEmoji: Record<string, string> = {
  General: "📌",
  Academic: "📚",
  Events: "🎉",
  Emergency: "🚨",
  Welfare: "🤝",
  Other: "📋",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
        categoryStyles[category] ?? categoryStyles.Other
      }`}
    >
      <span>{categoryEmoji[category]}</span>
      {category}
    </span>
  );
}

// ── Detail Modal ───────────────────────────────────────────────────
function DetailModal({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
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
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <CategoryBadge category={announcement.category} />
                {announcement.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border bg-amber-400/10 text-amber-400 border-amber-400/25">
                    <Pin className="w-2.5 h-2.5" />
                    Pinned
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white leading-snug">
                {announcement.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  {announcement.authorName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(announcement.createdAt).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
            {announcement.content}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Announcement Card ──────────────────────────────────────────────
function AnnouncementCard({
  announcement,
  onClick,
  index,
}: {
  announcement: Announcement;
  onClick: () => void;
  index: number;
}) {
  const color = categoryColors[announcement.category] ?? "#10b981";
  const isEmergency = announcement.category === "Emergency";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className={`relative group bg-zinc-900/70 border rounded-xl p-5 cursor-pointer transition-all hover:border-opacity-60 hover:bg-zinc-900 ${
        isEmergency
          ? "border-red-500/30 hover:border-red-500/50"
          : announcement.isPinned
            ? "border-amber-500/20 hover:border-amber-500/35"
            : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      {/* Left color bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
        style={{ backgroundColor: color }}
      />

      <div className="pl-4">
        {/* Top row */}
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <CategoryBadge category={announcement.category} />
          {announcement.isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border bg-amber-400/10 text-amber-400 border-amber-400/25">
              <Pin className="w-2.5 h-2.5" />
              Pinned
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-base leading-snug mb-2 group-hover:text-emerald-100 transition-colors">
          {announcement.title}
        </h3>

        {/* Preview */}
        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 mb-3">
          {announcement.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {announcement.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(announcement.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            Read more →
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function StudentsAnnouncementPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selected, setSelected] = useState<Announcement | null>(null);

  // Auth — must be logged in (students or admin can view)
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
        limit: "9",
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

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);
  const regularAnnouncements = announcements.filter((a) => !a.isPinned);

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
        <div className="absolute top-0 left-1/3 w-150 h-75 rounded-full bg-emerald-500/3 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/3 blur-[100px]" />
      </div>

      <main className="relative z-10 pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-0.5 bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                SWIS Platform
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Announcements
                </h1>
                <p className="text-zinc-500 text-sm">
                  {total} announcement{total !== 1 ? "s" : ""} from the student
                  affairs office
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium shrink-0">
                <Bell className="w-3.5 h-3.5" />
                Email alerts active
              </div>
            </div>
          </motion.div>

          {/* Error */}
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
          </AnimatePresence>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-300">
                Filter
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
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
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setCategoryFilter("");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    categoryFilter === ""
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCategoryFilter(c);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      categoryFilter === c
                        ? `border-opacity-50 text-white`
                        : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:border-zinc-600"
                    }`}
                    style={
                      categoryFilter === c
                        ? {
                            backgroundColor: `${categoryColors[c]}18`,
                            borderColor: `${categoryColors[c]}50`,
                            color: categoryColors[c],
                          }
                        : {}
                    }
                  >
                    {categoryEmoji[c]} {c}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center p-24">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
            </div>
          ) : announcements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <Megaphone className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No announcements found</p>
              {(search || categoryFilter) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("");
                  }}
                  className="mt-3 text-emerald-400 text-sm hover:underline"
                >
                  Clear filters
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Pinned section */}
              {pinnedAnnouncements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Pin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      Pinned
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {pinnedAnnouncements.map((a, i) => (
                      <AnnouncementCard
                        key={a._id}
                        announcement={a}
                        onClick={() => setSelected(a)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular announcements */}
              {regularAnnouncements.length > 0 && (
                <div>
                  {pinnedAnnouncements.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Megaphone className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        All Announcements
                      </span>
                    </div>
                  )}
                  <div className="grid gap-3">
                    {regularAnnouncements.map((a, i) => (
                      <AnnouncementCard
                        key={a._id}
                        announcement={a}
                        onClick={() => setSelected(a)}
                        index={pinnedAnnouncements.length + i}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 px-1">
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
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <DetailModal
            announcement={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
