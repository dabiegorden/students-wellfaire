"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { COMPLAINT_CATEGORIES } from "@/lib/academics";

const NewComplaintPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Academic",
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!formData.title.trim()) {
      toast.error("Enter a title first so the AI can draft a description.");
      return;
    }
    try {
      setGenerating(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/complaints/generate-description", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setFormData((prev) => ({ ...prev, description: data.description }));
      toast.success("AI description generated. Feel free to edit it.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate description",
      );
    } finally {
      setGenerating(false);
    }
  };

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

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit complaint");
      }

      setSuccess(true);
      toast.success("Complaint submitted. AI has assigned a priority.");
      setTimeout(() => router.push("/students-dashboard/complaints"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-cug-green" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Complaint Submitted
          </h2>
          <p className="text-muted-foreground">
            Our team will review it shortly. Redirecting to your complaints...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/students-dashboard/complaints"
          className="mb-3 inline-block text-sm font-medium text-cug-green hover:underline"
        >
          ← Back to Complaints
        </Link>
        <h1 className="text-3xl font-bold text-foreground">
          Submit New Complaint
        </h1>
        <p className="mt-1 text-muted-foreground">
          Provide details about your complaint so we can help you better.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block font-medium text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Brief title of your complaint"
            maxLength={100}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cug-green focus:outline-none"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {formData.title.length}/100 characters
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium text-foreground">
            Category <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-cug-green focus:outline-none"
            required
          >
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cug-green/30 bg-cug-green/10 px-3 py-1.5 text-xs font-semibold text-cug-green transition-colors hover:bg-cug-green/20 disabled:opacity-50"
            >
              {generating ? (
                <Loader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {generating ? "Generating..." : "Generate with AI"}
            </button>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Provide detailed information about your complaint, or generate a draft with AI..."
            rows={6}
            maxLength={1000}
            className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cug-green focus:outline-none"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {formData.description.length}/1000 characters · Priority is assigned
            automatically by AI.
          </p>
        </div>

        <div className="flex gap-3 border-t border-border pt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-cug-green py-3 font-medium text-white transition-colors hover:bg-cug-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader className="h-4 w-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
          <Link
            href="/students-dashboard/complaints"
            className="flex-1 rounded-lg bg-muted py-3 text-center font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default NewComplaintPage;
