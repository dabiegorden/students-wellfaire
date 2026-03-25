"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Send,
  FileText,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

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
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

const CATEGORIES = [
  { value: "Academic", label: "Academic", icon: "📚" },
  { value: "Welfare", label: "Welfare", icon: "🤝" },
  { value: "Accommodation", label: "Accommodation", icon: "🏠" },
  { value: "Finance", label: "Finance", icon: "💳" },
  { value: "Health", label: "Health", icon: "🏥" },
  { value: "Other", label: "Other", icon: "📋" },
] as const;

export default function ComplaintsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  const watchedTitle = watch("title");
  const watchedCategory = watch("category");
  const watchedDescription = watch("description");

  const canGenerateDescription = watchedTitle?.length >= 5 && watchedCategory;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  const handleGenerateDescription = async () => {
    if (!canGenerateDescription) return;

    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/complaints/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: getValues("title"),
          category: getValues("category"),
        }),
      });

      if (!response.ok) throw new Error("Failed to generate description");

      const data = await response.json();
      setValue("description", data.description, { shouldValidate: true });
      setAiUsed(true);
      toast.success("AI has drafted your description. Feel free to edit it.");

      setTimeout(() => {
        descriptionRef.current?.focus();
      }, 100);
    } catch (err) {
      toast.error("Couldn't generate description. Please write it manually.");
    } finally {
      setIsGenerating(false);
    }
  };

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

      toast.success(
        "Your complaint has been submitted. Priority is being assessed.",
      );
      reset();
      setAiUsed(false);
      setTimeout(() => router.push("/track-response"), 1800);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit complaint",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-125 h-125 rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-100 h-100 rounded-full bg-teal-400/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-linear(circle, #10b981 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 flex items-start justify-center min-h-screen px-4 py-16">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5 bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                Student Portal
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Submit a{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-300">
                Complaint
              </span>
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed">
              Your complaint will be reviewed by an admin. Priority is
              automatically assessed — you don't need to select one.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Complaint Title <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Issues with exam grading in COMP301"
                  className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 rounded-xl text-white placeholder-zinc-600 outline-none transition-all text-sm"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Category <span className="text-emerald-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        value={cat.value}
                        {...register("category")}
                        className="sr-only peer"
                      />
                      <div className="flex flex-col items-center gap-1.5 px-3 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-500 text-xs font-medium transition-all peer-checked:border-emerald-500/60 peer-checked:bg-emerald-500/5 peer-checked:text-emerald-300 hover:border-zinc-700 hover:text-zinc-300">
                        <span className="text-lg">{cat.icon}</span>
                        {cat.label}
                      </div>
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Description with AI */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300">
                    Description <span className="text-emerald-400">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={!canGenerateDescription || isGenerating}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Writing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Draft
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    placeholder={
                      canGenerateDescription
                        ? "Click 'AI Draft' to auto-fill, or write your own description…"
                        : "Fill in the title and category first, then you can use AI to draft this…"
                    }
                    rows={7}
                    className="w-full px-4 py-3 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 rounded-xl text-white placeholder-zinc-600 outline-none transition-all text-sm resize-none"
                    {...register("description")}
                    ref={(e) => {
                      register("description").ref(e);
                      (descriptionRef as any).current = e;
                    }}
                  />
                  <AnimatePresence>
                    {aiUsed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-emerald-400/70 bg-emerald-400/5 border border-emerald-400/20 rounded-md px-2 py-1"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        AI-drafted · edit freely
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {errors.description && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.description.message}
                  </p>
                )}

                {!canGenerateDescription && (
                  <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    AI Draft unlocks after you fill in the title and category
                  </p>
                )}
              </div>

              {/* Priority notice */}
              <div className="flex items-start gap-3 px-4 py-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
                <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <span className="text-zinc-200 font-medium">
                    Priority is auto-assigned.
                  </span>{" "}
                  Our AI analyses your complaint upon submission and assigns the
                  appropriate priority level — you don't need to select one.
                </p>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="group w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting & analysing…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Complaint
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </motion.button>

              {/* Track response */}
              <div className="text-center pt-2 border-t border-zinc-800/60">
                <p className="text-zinc-500 text-xs mb-2">
                  Already submitted a complaint?
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/track-response")}
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Track your response
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
