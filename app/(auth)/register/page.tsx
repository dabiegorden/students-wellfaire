"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Hash,
  AlertCircle,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { FACULTIES, PROGRAMMES, LEVELS } from "@/lib/academics";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    faculty: "",
    level: "",
    programme: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const required = Object.entries(formData);
    if (required.some(([, v]) => !v)) {
      const message = "Please fill in all fields";
      setError(message);
      toast.error(message);
      return;
    }

    if (!/^(UGR|UGW)\d{10}$/i.test(formData.studentId)) {
      const message =
        "Invalid Student ID. (e.g., UGR1234567890 | UGW1234567890)";
      setError(message);
      toast.error(message);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      const message = "Please enter a valid email address";
      setError(message);
      toast.error(message);
      return;
    }

    if (formData.password.length < 8) {
      const message = "Password must be at least 8 characters";
      setError(message);
      toast.error(message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const message = "Passwords do not match";
      setError(message);
      toast.error(message);
      return;
    }

    if (!termsAccepted) {
      const message = "You must accept the terms and conditions";
      setError(message);
      toast.error(message);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data.error || "Registration failed";
        setError(message);
        toast.error(message);
        return;
      }

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Registration successful! Redirecting...");
      router.push("/students-dashboard");
    } catch (err) {
      const message = "An error occurred during registration. Please try again.";
      setError(message);
      toast.error(message);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register with your verified Student ID to join the portal."
    >
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="studentId"
              placeholder="e.g., UGR1234567890"
              maxLength={13}
              value={formData.studentId}
              onChange={handleInputChange}
              className="h-11 pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Must start with UGR or UGW followed by digits (13 characters). Your
            ID is verified against university records.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                className="h-11 pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleInputChange}
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="student@cug.edu.gh"
              value={formData.email}
              onChange={handleInputChange}
              className="h-11 pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Faculty</Label>
            <Select
              value={formData.faculty}
              onValueChange={(v) => handleSelectChange("faculty", v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select faculty" />
              </SelectTrigger>
              <SelectContent>
                {FACULTIES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Level</Label>
            <Select
              value={formData.level}
              onValueChange={(v) => handleSelectChange("level", v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Course / Programme</Label>
          <Select
            value={formData.programme}
            onValueChange={(v) => handleSelectChange("programme", v)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select programme" />
            </SelectTrigger>
            <SelectContent>
              {PROGRAMMES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleInputChange}
                className="h-11 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cug-green"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="h-11 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cug-green"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(c) => setTermsAccepted(c as boolean)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="cursor-pointer text-xs leading-relaxed text-muted-foreground">
            I agree to the terms and conditions and privacy policy.
          </Label>
        </div>

        <Button type="submit" disabled={isLoading} className="h-11 w-full">
          {isLoading ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" /> Creating
              account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-cug-green hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
