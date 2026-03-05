"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  studentId: {
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
  };
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

const categories = [
  "Academic",
  "Accommodation",
  "Disciplinary",
  "Financial",
  "Health",
  "Other",
];
const priorities = ["Low", "Medium", "High", "Critical"];
const statuses = ["Pending", "In Progress", "Resolved", "Closed"];

export default function ComplaintsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [formData, setFormData] = useState({
    adminReply: "",
    status: "",
    priority: "",
  });

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = await response.json();
        if (data.user.role !== "admin") {
          router.push("/");
          return;
        }
        setUser(data.user);
      } catch (err) {
        router.push("/login");
      } finally {
        setIsLoadingAuth(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fetch complaints
  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [page, search, statusFilter, priorityFilter, categoryFilter, user]);

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
        priority: priorityFilter,
        category: categoryFilter,
      });

      const response = await fetch(`/api/complaints?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch complaints");

      const data = await response.json();
      setComplaints(data.complaints);
      setTotalPages(data.pagination.pages);
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
      priority: complaint.priority,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this complaint?")) return;

    try {
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/complaints/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete complaint");

      setSuccess("Complaint deleted successfully");
      fetchComplaints();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update complaint");

      setSuccess("Complaint updated successfully");
      setShowModal(false);
      fetchComplaints();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/30";
      case "In Progress":
        return "bg-blue-400/10 text-blue-400 border-blue-400/30";
      case "Resolved":
        return "bg-green-400/10 text-green-400 border-green-400/30";
      case "Closed":
        return "bg-zinc-400/10 text-zinc-400 border-zinc-400/30";
      default:
        return "bg-zinc-400/10 text-zinc-400 border-zinc-400/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-green-400/10 text-green-400 border-green-400/30";
      case "Medium":
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/30";
      case "High":
        return "bg-orange-400/10 text-orange-400 border-orange-400/30";
      case "Critical":
        return "bg-red-400/10 text-red-400 border-red-400/30";
      default:
        return "bg-zinc-400/10 text-zinc-400 border-zinc-400/30";
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) return null;

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
            <h1 className="text-3xl font-bold text-white mb-2">
              Complaints Management
            </h1>
            <p className="text-zinc-400">View and manage student complaints</p>
          </motion.div>

          {/* Alerts */}
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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400"
            >
              <span className="text-sm font-medium">{success}</span>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                <Input
                  placeholder="Search complaints..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 h-10 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 text-white placeholder:text-zinc-500 rounded-lg"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-zinc-800/50 border border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-lg focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-zinc-800/50 border border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-lg focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-zinc-800/50 border border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-lg focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Complaints Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center p-12">
                <p className="text-zinc-400">No complaints found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50 border-b border-zinc-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {complaints.map((complaint) => (
                      <tr
                        key={complaint?._id}
                        className="hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">
                            {complaint?.title}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-zinc-400 text-sm">
                            {complaint?.studentId?.firstName}{" "}
                            {complaint?.studentId?.lastName}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-zinc-300 text-sm">
                            {complaint?.category}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(complaint.priority)}`}
                          >
                            {complaint?.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(complaint.status)}`}
                          >
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-zinc-400 text-sm">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(complaint)}
                              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(complaint._id)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-800/50">
                <span className="text-sm text-zinc-400">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {selectedComplaint.title}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complaint Details */}
            <div className="space-y-4 mb-6 pb-6 border-b border-zinc-700">
              <div>
                <p className="text-zinc-400 text-sm mb-1">Student</p>
                <p className="text-white">
                  {selectedComplaint?.studentId?.firstName}{" "}
                  {selectedComplaint?.studentId?.lastName}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Category</p>
                  <p className="text-white">{selectedComplaint?.category}</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Priority</p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(selectedComplaint.priority)}`}
                  >
                    {selectedComplaint?.priority}
                  </span>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedComplaint.status)}`}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-1">Description</p>
                <p className="text-white">{selectedComplaint.description}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-zinc-400 text-sm">Admin Reply</label>
                <textarea
                  value={formData.adminReply}
                  onChange={(e) =>
                    setFormData({ ...formData, adminReply: e.target.value })
                  }
                  rows={4}
                  className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter your reply..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 text-sm">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 text-sm">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Update
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
