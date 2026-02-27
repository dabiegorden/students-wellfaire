"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  category: z.enum([
    "Academic",
    "Welfare",
    "Accommodation",
    "Finance",
    "Health",
    "Other",
  ]),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

const CATEGORIES = [
  "Academic",
  "Welfare",
  "Accommodation",
  "Finance",
  "Health",
  "Other",
] as const;
const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export default function ComplaintsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      priority: "Medium",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  const onSubmit = async (data: ComplaintFormData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to submit a complaint");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit complaint");
      }

      const result = await response.json();
      toast.success("Your complaint has been submitted successfully!");
      reset();
      setTimeout(() => router.push("/track-response"), 1500);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit complaint",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Background linear overlay */}
      <div className="fixed inset-0 bg-linear-to-br from-emerald-400/10 via-transparent to-cyan-400/10 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text">
              Submit a Complaint
            </h1>
            <p className="text-zinc-400 text-lg">
              Help us improve by sharing your concerns. We'll get back to you as
              soon as possible.
            </p>
          </div>

          {/* Form Card */}
          <div className="backdrop-blur-xl bg-zinc-900/40 border border-zinc-700/50 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title Field */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Complaint Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Brief summary of your complaint"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category Field */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="category"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all appearance-none cursor-pointer"
                  {...register("category")}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  placeholder="Provide detailed information about your complaint"
                  rows={6}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all resize-none"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Priority Field */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Priority Level
                </label>
                <div className="flex gap-4">
                  {PRIORITIES.map((pri) => (
                    <label
                      key={pri}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={pri}
                        {...register("priority")}
                        className="w-4 h-4 accent-emerald-400 cursor-pointer"
                      />
                      <span className="ml-2 text-white">{pri}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-linear-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
                >
                  {isLoading ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>

              {/* Track Response Link */}
              <div className="text-center pt-4 border-t border-zinc-700/50">
                <p className="text-zinc-400 text-sm mb-2">
                  Have an existing complaint?
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/track-response")}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Track your response
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
