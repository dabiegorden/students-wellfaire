"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { AlertCircle, Loader, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";

interface AnalyticsData {
  summary: {
    totalComplaints: number;
    resolvedComplaints: number;
    pendingComplaints: number;
    inProgressComplaints: number;
    closedComplaints: number;
    resolutionRate: number;
    totalStudents: number;
  };
  categoryData: Array<{ name: string; value: number }>;
  priorityData: Array<{ name: string; value: number }>;
  facultyData: Array<{ name: string; value: number }>;
}

const COLORS = [
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState("30");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user && user.role !== "admin") {
      router.push("/student-dashboard");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/analytics?days=${days}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
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

  const statCards = analyticsData
    ? [
        {
          label: "Total Complaints",
          value: analyticsData.summary.totalComplaints,
          color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
        },
        {
          label: "Resolved",
          value: analyticsData.summary.resolvedComplaints,
          color: "bg-green-500/10 border-green-500/30 text-green-400",
        },
        {
          label: "Pending",
          value: analyticsData.summary.pendingComplaints,
          color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
        },
        {
          label: "In Progress",
          value: analyticsData.summary.inProgressComplaints,
          color: "bg-orange-500/10 border-orange-500/30 text-orange-400",
        },
        {
          label: "Resolution Rate",
          value: `${analyticsData.summary.resolutionRate}%`,
          color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        },
        {
          label: "Total Students",
          value: analyticsData.summary.totalStudents,
          color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-between items-start"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Analytics & Insights
              </h1>
              <p className="text-zinc-400">
                Comprehensive dashboard of complaints and student welfare
                metrics
              </p>
            </div>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-40 h-10 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : analyticsData ? (
            <>
              {/* Stat Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              >
                {statCards.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-xl p-6 ${card.color}`}
                  >
                    <p className="text-sm font-medium opacity-80 mb-2">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Charts Row 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
              >
                {/* Category Distribution */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Complaints by Category
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Priority Distribution */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Complaints by Priority
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.priorityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis dataKey="name" stroke="#a1a1aa" />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Charts Row 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 gap-6"
              >
                {/* Faculty Distribution */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Complaints by Faculty
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={analyticsData.facultyData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 300 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis type="number" stroke="#a1a1aa" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#a1a1aa"
                        width={290}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Summary Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold text-white mb-6">
                  Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-zinc-400 text-sm mb-2">
                      Closed Complaints
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {analyticsData.summary.closedComplaints}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm mb-2">Total Students</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {analyticsData.summary.totalStudents}
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
