"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  AlertCircle,
  Loader,
  Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";

interface Complaint {
  _id: string;
  studentName: string;
  studentEmail: string;
  title: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user && user.role !== "admin") {
      router.push("/student-dashboard");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchComplaints();
  }, [reportType, dateRange]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      let filter = "";

      if (reportType !== "all") {
        filter = `&status=${reportType}`;
      }

      const response = await fetch(
        `/api/complaints?page=1&limit=1000${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();
      setComplaints(data.complaints);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = (data: Complaint[], filename: string) => {
    const ws_data = [
      [
        "Student Name",
        "Email",
        "Title",
        "Category",
        "Priority",
        "Status",
        "Description",
        "Submitted Date",
        "Admin Reply",
      ],
      ...data.map((complaint) => [
        complaint.studentName,
        complaint.studentEmail,
        complaint.title,
        complaint.category,
        complaint.priority,
        complaint.status,
        complaint.description,
        new Date(complaint.createdAt).toLocaleDateString(),
        complaint.adminReply || "N/A",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaints");

    // Style the header row
    ws["!cols"] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 40 },
      { wch: 15 },
      { wch: 30 },
    ];

    XLSX.writeFile(wb, filename);
  };

  const handleDownload = () => {
    const now = new Date();
    const timestamp = now.toISOString().split("T")[0];
    const filename = `complaints-report-${reportType}-${timestamp}.xlsx`;
    exportToExcel(complaints, filename);
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

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
            <p className="text-zinc-400">
              Generate and download complaints reports
            </p>
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

          {/* Report Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {/* Filters Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Report Filters
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-800/50 border border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-lg focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">All Complaints</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-800/50 border border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-lg focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last Year</option>
                  </select>
                </div>

                <Button
                  onClick={handleDownload}
                  disabled={complaints.length === 0 || loading}
                  className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300 font-semibold h-10 rounded-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download as Excel
                </Button>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Report Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-300">Total Records</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {complaints.length}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-300">Report Type</span>
                  <span className="text-sm font-medium text-zinc-100 capitalize">
                    {reportType === "all" ? "All Complaints" : reportType}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-300">Generated</span>
                  <span className="text-sm font-medium text-zinc-100">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Data Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">
                Report Preview
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center p-12">
                <p className="text-zinc-400">
                  No complaints found for this filter
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800/50 border-b border-zinc-700">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-zinc-300">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-zinc-300">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-zinc-300">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-zinc-300">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {complaints.slice(0, 10).map((complaint) => (
                      <tr
                        key={complaint._id}
                        className="hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div>
                            <p className="text-white font-medium">
                              {complaint.studentName}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {complaint.studentEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-white truncate max-w-xs">
                            {complaint.title}
                          </p>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-zinc-400 text-sm">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {complaints.length > 10 && (
                  <div className="px-6 py-3 border-t border-zinc-800 text-center text-sm text-zinc-400">
                    Showing 10 of {complaints.length} records. Download to see
                    all.
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-emerald-400/10 border border-emerald-400/30 rounded-xl p-4"
          >
            <p className="text-emerald-400 text-sm">
              Excel reports include detailed complaint information, student
              details, priority levels, status, and admin responses. Use these
              reports for analysis and documentation purposes.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
