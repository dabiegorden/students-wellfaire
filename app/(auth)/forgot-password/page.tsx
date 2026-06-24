"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setSent(true);
      toast.success("If that email exists, a reset code has been sent.");
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a 6-digit reset code."
    >
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {sent ? (
        <div className="rounded-lg border border-cug-green/30 bg-cug-green/10 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-cug-green" />
          <p className="mt-3 font-semibold text-foreground">Check your email</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We are redirecting you to enter your reset code...
          </p>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="student@cug.edu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="h-11 w-full">
            {isLoading ? (
              <>
                <Loader className="mr-2 h-5 w-5 animate-spin" /> Sending...
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-cug-green hover:underline">
              Back to Log In
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
