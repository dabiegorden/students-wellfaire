"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, LogOut, MessageSquare, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "Announcements", href: "/announcements" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          localStorage.removeItem("token");
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setUserMenuOpen(false);
      router.push("/");
    }
  };

  const dashboardHref =
    user?.role === "admin" ? "/admin-dashboard" : "/students-dashboard";

  return (
    <>
      {/* Top gold accent bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-[var(--cug-gold)]" />

      <nav className="fixed inset-x-0 top-1 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <Logo variant="dark" />

            {/* Desktop nav */}
            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? "text-[var(--cug-green)]"
                          : "text-foreground/70 hover:text-[var(--cug-green)]"
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[var(--cug-gold)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
              {user && (
                <li>
                  <Link
                    href={
                      user.role === "students" ? "/messages" : dashboardHref
                    }
                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-[var(--cug-green)] hover:opacity-80"
                  >
                    {user.role === "students" ? (
                      <MessageSquare className="h-4 w-4" />
                    ) : (
                      <LayoutDashboard className="h-4 w-4" />
                    )}
                    {user.role === "students" ? "Messages" : "Dashboard"}
                  </Link>
                </li>
              )}
            </ul>

            {/* Right side */}
            <div className="hidden items-center gap-2 lg:flex">
              <LanguageSwitcher />
              <ThemeToggle />
              {isLoading ? (
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
              ) : user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 hover:border-[var(--cug-green)]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--cug-green)] text-sm font-bold text-white">
                      {user.firstName?.charAt(0) || "U"}
                    </span>
                    <span className="text-left">
                      <span className="block text-sm font-semibold text-foreground">
                        {user.firstName} {user.lastName?.charAt(0)}.
                      </span>
                      <span className="block text-xs capitalize text-muted-foreground">
                        {user.role === "students" ? "Student" : "Admin"}
                      </span>
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                      <div className="border-b border-border bg-muted/40 px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {user.email}
                        </p>
                        {user.studentId && (
                          <p className="mt-1 text-xs font-medium text-[var(--cug-green)]">
                            ID: {user.studentId}
                          </p>
                        )}
                      </div>
                      <Link
                        href={dashboardHref}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Log In
                    </Button>
                  </Link>
                  {/* <Link href="/register">
                    <Button size="sm">Get Started</Button>
                  </Link> */}
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <div className="flex items-center gap-1 lg:hidden">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                className="p-2 text-foreground"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-xs overflow-y-auto bg-background p-6 pt-24 shadow-xl">
            {user && (
              <div className="mb-4 border-b border-border pb-4">
                <p className="font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block border-b border-border/60 px-2 py-3 text-sm font-semibold text-foreground hover:text-[var(--cug-green)]"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setIsOpen(false)}
                  className="block border-b border-border/60 px-2 py-3 text-sm font-semibold text-[var(--cug-green)]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-4 flex items-center gap-2 px-2 py-3 text-sm font-semibold text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <div className="mt-6 space-y-3">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                {/* <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link> */}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spacer for fixed nav */}
      <div className="h-[68px] lg:h-[84px]" />
    </>
  );
}
