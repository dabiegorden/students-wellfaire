"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Complaint {
  _id: string;
  title: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-500/20 border-amber-500/50 text-amber-200",
  "In Progress": "bg-blue-500/20 border-blue-500/50 text-blue-200",
  Resolved: "bg-cug-green/20 border-cug-green/50 text-cug-green",
  Closed: "bg-muted border-border/50 text-foreground",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  Medium: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  High: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function TrackResponsePage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const verifyAndFetch = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          router.push("/login");
          return;
        }
        setIsAuthenticated(true);
        fetchComplaints(token, 1);
      } catch (error) {
        router.push("/login");
      }
    };
    verifyAndFetch();
  }, [router]);

  const fetchComplaints = async (token: string, pageNum: number) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "all") {
        query.append("status", statusFilter);
      }
      query.append("page", pageNum.toString());
      query.append("limit", "10");

      const response = await fetch(`/api/complaints?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();
      setComplaints(data.complaints);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    const token = localStorage.getItem("token");
    if (token) {
      fetchComplaints(token, 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchComplaints(token, newPage);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background linear overlay */}
      <div className="fixed inset-0 bg-linear-to-br from-cug-green/10 via-transparent to-cug-green-dark/10 pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-linear-to-r from-cug-green via-cug-green to-cug-green-dark bg-clip-text">
              Track Your Complaints
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitor the status of your submissions and view admin responses
            </p>
          </div>

          {/* Filter Section */}
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleStatusFilterChange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-linear-to-r from-cug-green to-cug-green-dark text-foreground"
                  : "bg-muted text-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            {["Pending", "In Progress", "Resolved", "Closed"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === status
                    ? "bg-linear-to-r from-cug-green to-cug-green-dark text-foreground"
                    : "bg-muted text-foreground hover:bg-muted"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Complaints List */}
          <div className="space-y-4 mb-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin mb-4">
                    <div className="w-12 h-12 border-4 border-border border-t-cug-green rounded-full" />
                  </div>
                  <p className="text-muted-foreground">Loading your complaints...</p>
                </div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="backdrop-blur-xl bg-card/40 border border-border rounded-2xl p-12 text-center">
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-6">
                  No complaints found
                </p>
                <button
                  onClick={() => router.push("/complaints")}
                  className="px-6 py-3 bg-linear-to-r from-cug-green to-cug-green-dark hover:from-cug-green hover:to-cug-green-dark text-foreground font-semibold rounded-lg transition-all"
                >
                  Submit a Complaint
                </button>
              </div>
            ) : (
              complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="backdrop-blur-xl bg-card/40 border border-border rounded-2xl overflow-hidden transition-all hover:border-cug-green/30"
                >
                  {/* Complaint Header - Always Visible */}
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === complaint._id ? null : complaint._id,
                      )
                    }
                    className="w-full p-6 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-foreground font-semibold text-lg flex-1">
                            {complaint.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              STATUS_COLORS[complaint.status] ||
                              "bg-muted border-border/50 text-foreground"
                            }`}
                          >
                            {complaint.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                          <span className="text-sm text-muted-foreground">
                            Category:{" "}
                            <span className="text-cug-green">
                              {complaint.category}
                            </span>
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${
                              PRIORITY_COLORS[complaint.priority]
                            }`}
                          >
                            {complaint.priority} Priority
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${
                          expandedId === complaint._id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expandable Content */}
                  {expandedId === complaint._id && (
                    <div className="border-t border-border bg-card/20">
                      <div className="p-6 space-y-6">
                        {/* Full Description */}
                        <div>
                          <h4 className="text-foreground font-semibold mb-2">
                            Your Complaint
                          </h4>
                          <p className="text-foreground leading-relaxed">
                            {complaint.description}
                          </p>
                        </div>

                        {/* Admin Reply */}
                        {complaint.adminReply ? (
                          <div className="bg-cug-green/10 border border-cug-green/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-cug-green" />
                              <h4 className="text-cug-green font-semibold">
                                Admin Response
                              </h4>
                            </div>
                            <p className="text-foreground leading-relaxed">
                              {complaint.adminReply}
                            </p>
                            {complaint.repliedAt && (
                              <p className="text-xs text-cug-green/70 mt-3">
                                Replied on{" "}
                                {new Date(complaint.repliedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : complaint.status === "Pending" ? (
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                            <p className="text-amber-300 text-sm">
                              Your complaint is pending review. An admin will
                              respond soon.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <p className="text-blue-300 text-sm">
                              Your complaint is being processed. Please check
                              back for updates.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && complaints.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-muted text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Previous
              </button>
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-muted text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Submit New Complaint */}
          {!isLoading && complaints.length > 0 && (
            <div className="text-center mt-12 pt-8 border-t border-border">
              <button
                onClick={() => router.push("/complaints")}
                className="px-8 py-3 bg-linear-to-r from-cug-green to-cug-green-dark hover:from-cug-green hover:to-cug-green-dark text-foreground font-semibold rounded-lg transition-all shadow-lg hover:shadow-cug-green/25"
              >
                Submit New Complaint
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
