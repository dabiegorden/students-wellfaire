"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut, User, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { AdminSidebar } from "@/components/AdminSidebar";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "students";
  studentId?: string;
  programme?: string;
  level?: string;
  faculty?: string;
  staffId?: string;
  department?: string;
}

function DashboardContent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  const getDisplayName = () => {
    if (!user) return "User";
    return `${user.firstName} ${user.lastName}`;
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const firstInitial = user.firstName?.charAt(0) || "";
    const lastInitial = user.lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-400 to-teal-600 rounded-full blur-xl opacity-50" />
            <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-400" />
          </div>
          <p className="text-zinc-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={user} onLogout={handleLogout} />
      <SidebarInset>
        {/* Enhanced Header with Emerald/Teal Theme */}
        <header className="fixed top-0 right-0 left-0 z-50 flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg group-has-data-[collapsible=icon]/sidebar-wrapper:left-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors duration-200 rounded-lg p-2" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-zinc-700/50"
            />
            {/* Enhanced Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <div className="text-zinc-400 hover:text-white transition-colors duration-200 font-medium">
                    <Link href="/" className="flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-400 to-teal-600 rounded-lg blur-md opacity-50" />
                        <div className="relative w-8 h-8 bg-linear-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
                          <svg
                            width="16"
                            height="16"
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
                      <span className="text-lg font-bold bg-linear-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        SWIS
                      </span>
                    </Link>
                  </div>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-semibold flex items-center gap-2">
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Enhanced Header Actions */}
          <div className="ml-auto flex items-center gap-2 px-4">
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-all duration-200 rounded-lg relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" />
              </Button>
            </div>

            {/* User Profile Section */}
            {user && (
              <div className="flex items-center gap-3">
                {/* Desktop User Info */}
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-semibold text-white">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                </div>

                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 rounded-lg hover:bg-zinc-800/50 transition-colors p-1 cursor-pointer"
                    >
                      <Avatar className="h-9 w-9 border-2 border-linear-to-br from-emerald-400 to-teal-600">
                        <AvatarFallback className="bg-linear-to-br from-emerald-400 to-teal-600 text-zinc-950 font-bold text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-zinc-400 hidden sm:block" />
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 bg-zinc-900 border-zinc-800 text-zinc-200 mt-2"
                    align="end"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3 p-2">
                        <Avatar className="h-12 w-12 border-2 border-linear-to-br from-emerald-400 to-teal-600">
                          <AvatarFallback className="bg-linear-to-br from-emerald-400 to-teal-600 text-zinc-950 font-bold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-none text-white truncate">
                            {getDisplayName()}
                          </p>
                          <p className="text-xs leading-none text-zinc-400 truncate">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-linear-to-r from-emerald-400 to-teal-500 text-zinc-950 font-bold uppercase tracking-wider">
                              {user.role === "students" ? "Student" : "Admin"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />

                    {/* Role-specific info */}
                    {user.role === "students" && (
                      <div className="px-4 py-3 border-b border-zinc-800 text-xs space-y-1">
                        {user.studentId && (
                          <p className="text-zinc-300">
                            <span className="text-zinc-500">Student ID:</span>{" "}
                            <span className="text-emerald-400 font-medium">
                              {user.studentId}
                            </span>
                          </p>
                        )}
                        {user.programme && (
                          <p className="text-zinc-300 truncate">
                            <span className="text-zinc-500">Programme:</span>{" "}
                            {user.programme}
                          </p>
                        )}
                        {user.level && (
                          <p className="text-zinc-300">
                            <span className="text-zinc-500">Level:</span>{" "}
                            {user.level}
                          </p>
                        )}
                        {user.faculty && (
                          <p className="text-zinc-300 truncate">
                            <span className="text-zinc-500">Faculty:</span>{" "}
                            {user.faculty}
                          </p>
                        )}
                      </div>
                    )}

                    {user.role === "admin" && user.department && (
                      <div className="px-4 py-3 border-b border-zinc-800 text-xs">
                        {user.staffId && (
                          <p className="text-zinc-300 mb-1">
                            <span className="text-zinc-500">Staff ID:</span>{" "}
                            <span className="text-emerald-400 font-medium">
                              {user.staffId}
                            </span>
                          </p>
                        )}
                        {user.department && (
                          <p className="text-zinc-300 truncate">
                            <span className="text-zinc-500">Department:</span>{" "}
                            {user.department}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Mobile Actions */}
                    <div className="sm:hidden">
                      <DropdownMenuItem className="cursor-pointer text-zinc-300 focus:text-white focus:bg-zinc-800">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                    </div>

                    <DropdownMenuSeparator className="bg-zinc-800" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </header>

        {/* Enhanced Main Content with Emerald/Teal Theme */}
        <div className="pt-16 flex flex-1 flex-col min-h-screen bg-zinc-950">
          {/* Content Wrapper with proper spacing and mobile optimization */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 relative">
            {/* Background Decoration - Emerald/Teal linear */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              {/* Grid Pattern */}
              <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `linear-linear(rgba(255,255,255,0.1) 1px, transparent 1px),
                                   linear-linear(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: "50px 50px",
                }}
              />

              {/* linear Orbs */}
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
                className="absolute top-1/4 -right-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
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
                className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl"
              />
            </div>

            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>;
}
