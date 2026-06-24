"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password");
        return;
      }
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cug-green/10 text-cug-green">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-bold text-foreground">Change Password</h3>
          <p className="text-xs text-muted-foreground">
            Update the password you use to log in.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="current">Current Password</Label>
          <Input
            id="current"
            type={show ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Your current password"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new">New Password</Label>
          <div className="relative">
            <Input
              id="new"
              type={show ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cug-green"
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm New Password</Label>
          <Input
            id="confirm"
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="h-11"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Update Password
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
