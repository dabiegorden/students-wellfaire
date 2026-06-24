"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AdminSidebar } from "@/components/AdminSidebar";
import { StudentsSidebar } from "@/components/StudentsSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Spinner } from "@/components/ui/spinner";

export interface DashboardUser {
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

export function DashboardShell({
  variant,
  title,
  children,
}: {
  variant: "admin" | "students";
  title: string;
  children: ReactNode;
}) {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
          }
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        const u: DashboardUser = data.user;

        // Role guard: keep each portal to its own users
        if (variant === "admin" && u.role !== "admin") {
          router.push("/students-dashboard");
          return;
        }
        if (variant === "students" && u.role !== "students") {
          router.push("/admin-dashboard");
          return;
        }
        setUser(u);
      } catch (error) {
        console.error("Error fetching profile:", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [router, variant]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-cug-green" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      {variant === "admin" ? (
        <AdminSidebar user={user} onLogout={handleLogout} />
      ) : (
        <StudentsSidebar user={user} onLogout={handleLogout} />
      )}
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-30 flex h-16 w-full min-w-0 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator orientation="vertical" className="mr-2 h-4 shrink-0" />
          <h1 className="truncate text-base font-bold text-foreground">
            {title}
          </h1>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="ml-1 hidden text-right sm:block">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {user.role === "students" ? "Student" : "Administrator"}
              </p>
            </div>
          </div>
        </header>

        <div className="w-full min-w-0 max-w-full flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
