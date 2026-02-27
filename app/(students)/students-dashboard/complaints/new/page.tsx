"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader, CheckCircle2 } from "lucide-react";

const NewComplaintPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "academic",
    priority: "normal",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const categories = [
    "academic",
    "infrastructure",
    "discipline",
    "health",
    "facilities",
    "other",
  ];

  const priorities = ["low", "normal", "high"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/students/complaints", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit complaint");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin-dashboard/students/complaints");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center max-w-md w-full">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Complaint Submitted
          </h2>
          <p className="text-zinc-400 mb-6">
            Your complaint has been successfully submitted. Our admin team will
            review it shortly.
          </p>
          <p className="text-zinc-500 text-sm">
            Redirecting to your complaints...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin-dashboard/students/complaints"
            className="text-emerald-500 hover:text-emerald-400 font-medium mb-4 inline-block"
          >
            ← Back to Complaints
          </Link>
          <h1 className="text-4xl font-bold text-white">
            Submit New Complaint
          </h1>
          <p className="text-zinc-400 mt-2">
            Please provide details about your complaint so we can help you
            better
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 space-y-6"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-white font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Brief title of your complaint"
              maxLength={100}
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
            <p className="text-zinc-500 text-xs mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide detailed information about your complaint..."
              rows={6}
              maxLength={1000}
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              required
            />
            <p className="text-zinc-500 text-xs mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-zinc-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
            <Link
              href="/admin-dashboard/students/complaints"
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 rounded-lg transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewComplaintPage;
