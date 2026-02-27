"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Hash,
  BookOpen,
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
import { motion } from "framer-motion";
import { toast } from "sonner";

const faculties = [
  "Faculty of Computing Engineering and Mathematical Sciences: (CEMS)",
  "Faculty of Economics and Business Administration: (EBA)",
  "Faculty of Education: (ED)",
  "Faculty of Nursing and Midwifery: (SONAM)",
  "Faculty of Religious Studies: (RS)",
];

const levels = ["Level 100", "Level 200", "Level 300", "Level 400"];

const programmes = [
  "Computer Science",
  "Information Technology",
  "Business Administration",
  "Economics",
  "Nursing",
  "Education",
  "Psychology",
  "Sociology",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
];

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !formData.studentId ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.faculty ||
      !formData.level ||
      !formData.programme ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      toast.success("Registration successful! Redirecting...");

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setError("An error occurred during registration. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 -right-48 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-32 -left-32 w-150 h-150 bg-emerald-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-2/5 relative items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-400 to-teal-600 rounded-3xl blur-2xl opacity-50" />
            <div className="relative w-20 h-20 rounded-3xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                className="text-zinc-950"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="currentColor"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight text-center"
          >
            Join the
            <br />
            <span className="bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              SWIS Community
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-zinc-400 text-lg leading-relaxed mb-12 text-center"
          >
            Start making your voice heard. Report issues and help build a better
            campus experience at Catholic University of Ghana.
          </motion.p>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-4"
          >
            {[
              "Track your complaints in real-time",
              "Direct communication with administrators",
              "Get notified of status updates instantly",
            ].map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                className="flex items-center gap-3 text-zinc-300"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-400 to-teal-600 rounded-xl blur-lg opacity-50" />
              <div className="relative w-12 h-12 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-zinc-950"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
            <span className="font-bold text-xl text-white">SWIS</span>
          </div>

          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Form Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl opacity-50" />

            {/* Card */}
            <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 sm:p-10">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 backdrop-blur-sm border border-emerald-400/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">
                  Student Registration
                </span>
              </motion.div>

              <h2 className="text-3xl font-black text-white mb-2">
                Create your account
              </h2>
              <p className="text-zinc-400 text-sm mb-8">
                Fill in your details to join SWIS and start reporting campus
                issues
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 mb-6"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Student ID */}
                <div className="space-y-2">
                  <Label
                    htmlFor="studentId"
                    className="text-sm font-semibold text-zinc-300"
                  >
                    Student ID
                  </Label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      id="studentId"
                      placeholder="e.g., CUG2024001"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="pl-12 h-12 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 focus:bg-zinc-800 text-white placeholder:text-zinc-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-semibold text-zinc-300"
                    >
                      First Name
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-12 h-12 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 focus:bg-zinc-800 text-white placeholder:text-zinc-500 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-semibold text-zinc-300"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-12 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 focus:bg-zinc-800 text-white placeholder:text-zinc-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-zinc-300"
                  >
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@cug.edu.gh"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-12 h-12 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 focus:bg-zinc-800 text-white placeholder:text-zinc-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Faculty & Level */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="faculty"
                      className="text-sm font-semibold text-zinc-300"
                    >
                      Faculty
                    </Label>
                    <div className="relative group">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 z-10 pointer-events-none" />
                      <Select
                        value={formData.faculty}
                        onValueChange={(value) =>
                          handleSelectChange("faculty", value)
                        }
                      >
                        <SelectTrigger className="h-12 pl-12 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-xl">
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                          {faculties.map((faculty) => (
                            <SelectItem
                              key={faculty}
                              value={faculty}
                              className="focus:bg-zinc-800 focus:text-emerald-400"
                            >
                              {faculty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="level"
                      className="text-sm font-semibold text-zinc-300"
                    >
                      Level
                    </Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) =>
                        handleSelectChange("level", value)
                      }
                    >
                      <SelectTrigger className="h-12 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-xl">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {levels.map((level) => (
                          <SelectItem
                            key={level}
                            value={level}
                            className="focus:bg-zinc-800 focus:text-emerald-400"
                          >
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Programme/Course */}
                <div className="space-y-2">
                  <Label
                    htmlFor="programme"
                    className="text-sm font-semibold text-zinc-300"
                  >
                    Course/Programme
                  </Label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 z-10 pointer-events-none" />
                    <Select
                      value={formData.programme}
                      onValueChange={(value) =>
                        handleSelectChange("programme", value)
                      }
                    >
                      <SelectTrigger className="h-12 pl-12 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 text-white rounded-xl">
                        <SelectValue placeholder="Select programme" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {programmes.map((programme) => (
                          <SelectItem
                            key={programme}
                            value={programme}
                            className="focus:bg-zinc-800 focus:text-emerald-400"
                          >
                            {programme}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-zinc-300"
                    >
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-12 pr-12 h-12 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 focus:bg-zinc-800 text-white placeholder:text-zinc-500 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-zinc-300"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-12 pr-12 h-12 bg-zinc-800/50 border-zinc-700/50 focus:border-emerald-500/50 focus:bg-zinc-800 text-white placeholder:text-zinc-500 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked as boolean)
                    }
                    className="border-zinc-700 mt-1"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-xs text-zinc-400 cursor-pointer leading-relaxed"
                  >
                    I agree to the terms and conditions and privacy policy
                  </Label>
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: !isLoading ? 1.02 : 1 }}
                  whileTap={{ scale: !isLoading ? 0.98 : 1 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-linear-to-r from-emerald-400 to-teal-500 text-zinc-950 hover:from-emerald-300 hover:to-teal-400 font-bold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>

                {/* Login Link */}
                <p className="text-center text-sm text-zinc-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    Log In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
