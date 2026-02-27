"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Loader,
  Clock,
  CheckCircle2,
  Eye,
  Trash2,
  FileText,
} from "lucide-react";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  adminReply?: string;
  createdAt: string;
  repliedAt?: string;
}

const ComplaintsPage = () => {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });

        if (statusFilter) {
          queryParams.append("status", statusFilter);
        }

        const response = await fetch(
          `/api/students/complaints?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch complaints");
        }

        const data = await response.json();
        setComplaints(data.complaints);
        setTotalPages(data.pagination.pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [page, statusFilter, router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/students/complaints/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete complaint");

      setComplaints(complaints.filter((c) => c._id !== id));
      setSelectedComplaint(null);
      setShowModal(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete complaint",
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500";
      case "normal":
        return "bg-blue-500/10 text-blue-500";
      case "low":
        return "bg-emerald-500/10 text-emerald-500";
      default:
        return "bg-zinc-500/10 text-zinc-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in-progress":
        return <Loader className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="text-center">
          <Loader className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
          <p className="text-zinc-400">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">My Complaints</h1>
            <p className="text-zinc-400 mt-2">
              Track and manage your submitted complaints
            </p>
          </div>
          <Link
            href="/admin-dashboard/students/complaints/new"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            + New Complaint
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-6">
          <label className="text-zinc-300 text-sm font-medium mb-2 block">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Complaints List */}
        {complaints.length === 0 ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No complaints yet
            </h3>
            <p className="text-zinc-400 mb-4">
              You haven't submitted any complaints
            </p>
            <Link
              href="/dashboard/student/complaints/new"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Submit Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {complaint.title}
                    </h3>
                    <p className="text-zinc-400 text-sm line-clamp-2">
                      {complaint.description}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowModal(true);
                      }}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {complaint.status === "pending" && (
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                        title="Delete complaint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(
                      complaint.status,
                    )}`}
                  >
                    {getStatusIcon(complaint.status)}
                    {complaint.status.charAt(0).toUpperCase() +
                      complaint.status.slice(1)}
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      complaint.priority,
                    )}`}
                  >
                    {complaint.priority.charAt(0).toUpperCase() +
                      complaint.priority.slice(1)}{" "}
                    Priority
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
            >
              Previous
            </button>
            <span className="text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-700 flex items-center justify-between sticky top-0 bg-zinc-800">
                <h2 className="text-2xl font-bold text-white">
                  Complaint Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-zinc-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">
                    Title
                  </h3>
                  <p className="text-white text-lg">
                    {selectedComplaint.title}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">
                    Description
                  </h3>
                  <p className="text-zinc-300">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">
                      Category
                    </h3>
                    <p className="text-white capitalize">
                      {selectedComplaint.category}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">
                      Priority
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                        selectedComplaint.priority,
                      )}`}
                    >
                      {selectedComplaint.priority.charAt(0).toUpperCase() +
                        selectedComplaint.priority.slice(1)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">
                    Status
                  </h3>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                      selectedComplaint.status,
                    )}`}
                  >
                    {getStatusIcon(selectedComplaint.status)}
                    {selectedComplaint.status.charAt(0).toUpperCase() +
                      selectedComplaint.status.slice(1)}
                  </span>
                </div>

                {selectedComplaint.adminReply && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-emerald-500 mb-2">
                      Admin Reply
                    </h3>
                    <p className="text-zinc-300">
                      {selectedComplaint.adminReply}
                    </p>
                    {selectedComplaint.repliedAt && (
                      <p className="text-zinc-500 text-xs mt-2">
                        {new Date(selectedComplaint.repliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                  <span className="text-zinc-500 text-sm">
                    Submitted:{" "}
                    {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </span>
                  {selectedComplaint.status === "pending" && (
                    <button
                      onClick={() => handleDelete(selectedComplaint._id)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors font-medium"
                    >
                      Delete Complaint
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsPage;
