"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
}

interface Stats {
  users: {
    totalStudents: number;
    totalAdmins: number;
    studentsByFaculty: Array<{ _id: string; count: number }>;
    studentsByLevel: Array<{ _id: string; count: number }>;
  };
  complaints: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
    resolutionRate: number;
    averageResolutionTime: number;
    byPriority: Array<{ _id: string; count: number }>;
    byCategory: Array<{ _id: string; count: number }>;
    byStatus: Array<{ _id: string; count: number }>;
    byFaculty: Array<{ _id: string; count: number }>;
    last7Days: Array<{ _id: string; count: number }>;
  };
  recentActivity: Array<{
    _id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    studentId: {
      firstName: string;
      lastName: string;
      studentId: string;
    };
  }>;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    "In Progress": "bg-blue-400/10 text-blue-400 border-blue-400/30",
    Resolved: "bg-green-400/10 text-green-400 border-green-400/30",
    Closed: "bg-zinc-400/10 text-zinc-400 border-zinc-400/30",
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${statusColors[status] || statusColors.Pending}`}
    >
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityColors: Record<string, string> = {
    Low: "bg-blue-400/10 text-blue-400 border-blue-400/30",
    Medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    High: "bg-orange-400/10 text-orange-400 border-orange-400/30",
    Critical: "bg-red-400/10 text-red-400 border-red-400/30",
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[priority] || priorityColors.Medium}`}
    >
      {priority}
    </span>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUser(data.user);

      if (data.user.role !== "admin") {
        router.push("/");
        return;
      }

      fetchStats(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (token: string) => {
    try {
      setStatsLoading(true);
      setStatsError("");
      const response = await fetch("/api/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-zinc-400">
              Here's what's happening with your system today
            </p>
          </motion.div>

          {/* Stats Error */}
          {statsError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{statsError}</span>
            </motion.div>
          )}

          {statsLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-zinc-400 text-sm font-medium mb-1">
                    Total Students
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {stats.users.totalStudents}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-zinc-400 text-sm font-medium mb-1">
                    Total Complaints
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {stats.complaints.total}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-linear-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-zinc-400 text-sm font-medium mb-1">
                    Pending
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {stats.complaints.pending}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-linear-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-xs font-semibold text-green-400">
                      {stats.complaints.resolutionRate}%
                    </span>
                  </div>
                  <h3 className="text-zinc-400 text-sm font-medium mb-1">
                    Resolved
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {stats.complaints.resolved}
                  </p>
                </motion.div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Status Overview
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">In Progress</span>
                      <span className="text-white font-semibold">
                        {stats.complaints.inProgress}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 text-sm">Closed</span>
                      <span className="text-white font-semibold">
                        {stats.complaints.closed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                      <span className="text-zinc-400 text-sm">
                        Avg. Resolution
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        {stats.complaints.averageResolutionTime}h
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">
                      By Priority
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {stats.complaints.byPriority.slice(0, 4).map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center"
                      >
                        <PriorityBadge priority={item._id} />
                        <span className="text-white font-semibold">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Top Categories
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {stats.complaints.byCategory.slice(0, 4).map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-zinc-400 text-sm">
                          {item._id}
                        </span>
                        <span className="text-white font-semibold">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Bottom Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Recent Complaints
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {stats.recentActivity.length > 0 ? (
                      stats.recentActivity.map((complaint) => (
                        <div
                          key={complaint._id}
                          className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(`/admin-dashboard/complaints`)
                          }
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-white font-medium text-sm line-clamp-1">
                              {complaint?.title}
                            </h4>
                            <StatusBadge status={complaint?.status} />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-zinc-400 text-xs">
                              {complaint?.studentId?.firstName}{" "}
                              {complaint?.studentId?.lastName} •{" "}
                              {complaint?.studentId?.studentId}
                            </p>
                            <PriorityBadge priority={complaint?.priority} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-500 text-center py-8">
                        No recent complaints
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Students Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Students by Faculty
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {stats.users.studentsByFaculty.slice(0, 5).map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-zinc-400 text-sm truncate max-w-xs">
                          {item._id?.split(":")[0] || "Unknown"}
                        </span>
                        <span className="text-white font-semibold">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Complaints by Faculty */}
              {stats.complaints.byFaculty.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Complaints by Faculty
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.complaints.byFaculty.map((item) => (
                      <div
                        key={item._id}
                        className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4"
                      >
                        <p className="text-zinc-400 text-xs mb-2 truncate">
                          {item._id?.split(":")[0] || "Unknown"}
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {item.count}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
