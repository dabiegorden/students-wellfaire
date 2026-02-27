"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ArrowUpRight, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "students" | "admin";
  studentId?: string;
  staffId?: string;
  faculty?: string;
  level?: string;
  programme?: string;
  department?: string;
}

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user profile from /api/me
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token invalid, clear it
          localStorage.removeItem("token");
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Fetched user data:", data || "No data");
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mobile menu body lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      localStorage.removeItem("token");
      setUser(null);
      setUserMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      localStorage.removeItem("token");
      setUser(null);
      router.push("/");
    }
  };

  const getDashboardLink = () => {
    if (user?.role === "admin") {
      return "/admin-dashboard";
    } else if (user?.role === "students") {
      return "/students-dashboard";
    }
    return "/";
  };

  const getDisplayName = () => {
    if (!user) return "";

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    if (firstName && lastName) {
      return `${firstName} ${lastName.charAt(0)}.`;
    }

    if (firstName) {
      return firstName;
    }

    if (lastName) {
      return lastName;
    }

    return user.email?.split("@")[0] || "User";
  };

  const getRoleDisplay = () => {
    if (!user?.role) return "";
    return user.role === "students" ? "Student" : "Admin";
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link href="/" className="group relative z-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-400 to-teal-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-11 h-11 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
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
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base lg:text-lg tracking-tight text-white">
                    SWIS
                  </span>
                  <span className="text-[10px] text-zinc-400 tracking-wider uppercase">
                    CUG Welfare
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Nav - Only show when not logged in */}
            {!user && !isLoading && (
              <ul className="hidden lg:flex items-center gap-1">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <Link
                      href={link.href}
                      className="relative px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}

            {/* Desktop CTA / User Menu */}
            <div className="hidden lg:flex items-center gap-3">
              {isLoading ? (
                // Loading skeleton
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse" />
                    <div className="w-16 h-2 bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
              ) : user ? (
                <div className="relative" ref={menuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-zinc-950">
                        {user.firstName?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-zinc-400 capitalize">
                        {getRoleDisplay()}
                      </p>
                    </div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-800/30">
                          <p className="text-sm font-semibold text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {user.email}
                          </p>
                          {user.role === "students" && user.studentId && (
                            <p className="text-xs text-emerald-400 mt-1">
                              ID: {user.studentId}
                            </p>
                          )}
                          {user.role === "admin" && user.staffId && (
                            <p className="text-xs text-emerald-400 mt-1">
                              Staff ID: {user.staffId}
                            </p>
                          )}
                        </div>

                        {/* Additional Info */}
                        {user.role === "students" && (
                          <div className="px-4 py-3 border-b border-zinc-800 text-xs">
                            {user.programme && (
                              <p className="text-zinc-300 mb-1">
                                <span className="text-zinc-500">
                                  Programme:
                                </span>{" "}
                                {user.programme}
                              </p>
                            )}
                            {user.level && (
                              <p className="text-zinc-300 mb-1">
                                <span className="text-zinc-500">Level:</span>{" "}
                                {user.level}
                              </p>
                            )}
                            {user.faculty && (
                              <p className="text-zinc-300">
                                <span className="text-zinc-500">Faculty:</span>{" "}
                                {user.faculty}
                              </p>
                            )}
                          </div>
                        )}

                        {user.role === "admin" && user.department && (
                          <div className="px-4 py-3 border-b border-zinc-800 text-xs">
                            <p className="text-zinc-300">
                              <span className="text-zinc-500">Department:</span>{" "}
                              {user.department}
                            </p>
                          </div>
                        )}

                        {/* Menu Actions */}
                        <Link
                          href={getDashboardLink()}
                          className="block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-red-400 transition-colors flex items-center gap-2 border-t border-zinc-800"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-zinc-300 hover:text-white hover:bg-zinc-800/50 font-medium"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="relative overflow-hidden bg-linear-to-r from-emerald-400 to-teal-500 text-zinc-950 font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all group">
                        <span className="relative z-10 flex items-center gap-2">
                          Get Started
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-emerald-300 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </motion.div>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2 text-white"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-zinc-900 border-l border-zinc-800 overflow-y-auto"
            >
              <div className="flex flex-col h-full p-8 pt-28">
                {isLoading ? (
                  // Loading state
                  <div className="mb-8 pb-6 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="w-32 h-4 bg-zinc-800 rounded animate-pulse" />
                        <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ) : user ? (
                  <>
                    <div className="mb-8 pb-6 border-b border-zinc-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                          <span className="text-xl font-bold text-zinc-950">
                            {user.firstName?.charAt(0) ||
                              user.email?.charAt(0) ||
                              "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-emerald-400 mt-1 capitalize">
                            {getRoleDisplay()}
                          </p>
                        </div>
                      </div>

                      {/* Additional User Info */}
                      <div className="space-y-2 text-sm">
                        {user.role === "students" && (
                          <>
                            {user.studentId && (
                              <div className="flex justify-between">
                                <span className="text-zinc-500">
                                  Student ID:
                                </span>
                                <span className="text-zinc-300 font-medium">
                                  {user.studentId}
                                </span>
                              </div>
                            )}
                            {user.programme && (
                              <div className="flex justify-between">
                                <span className="text-zinc-500">
                                  Programme:
                                </span>
                                <span className="text-zinc-300 font-medium truncate ml-2">
                                  {user.programme}
                                </span>
                              </div>
                            )}
                            {user.level && (
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Level:</span>
                                <span className="text-zinc-300 font-medium">
                                  {user.level}
                                </span>
                              </div>
                            )}
                            {user.faculty && (
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Faculty:</span>
                                <span className="text-zinc-300 font-medium truncate ml-2">
                                  {user.faculty}
                                </span>
                              </div>
                            )}
                          </>
                        )}

                        {user.role === "admin" && (
                          <>
                            {user.staffId && (
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Staff ID:</span>
                                <span className="text-zinc-300 font-medium">
                                  {user.staffId}
                                </span>
                              </div>
                            )}
                            {user.department && (
                              <div className="flex justify-between">
                                <span className="text-zinc-500">
                                  Department:
                                </span>
                                <span className="text-zinc-300 font-medium truncate ml-2">
                                  {user.department}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mobile Menu Links */}
                    <Link
                      href={getDashboardLink()}
                      className="px-4 py-3 text-sm font-medium text-zinc-300 hover:text-emerald-400 transition-colors border-b border-zinc-800"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-zinc-300 hover:text-red-400 transition-colors mt-auto"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    {navLinks.map((link, i) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="mt-auto pt-6 border-t border-zinc-800 space-y-3">
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full text-zinc-300 border-zinc-700 hover:bg-zinc-800"
                        >
                          Log In
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-linear-to-r from-emerald-400 to-teal-500 text-zinc-950 font-semibold hover:shadow-lg hover:shadow-emerald-500/50">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
