"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, MessagesSquare, Megaphone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-cug-green p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:26px_26px]" />
        <div className="relative z-10 rounded-lg bg-white/95 p-3 w-fit">
          <Logo variant="dark" />
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-black leading-tight">
            Your voice matters at <span className="text-cug-gold">CUG</span>.
          </h2>
          <p className="mt-4 text-white/80">
            Report issues, chat with the Students Affairs Office, and track every
            resolution — all in one secure portal.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: ShieldCheck, text: "AI-triaged complaint handling" },
              { icon: MessagesSquare, text: "Real-time support chat" },
              { icon: Megaphone, text: "Official university announcements" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-cug-gold">
                  <f.icon className="h-5 w-5" />
                </span>
                <span className="text-sm text-white/90">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Catholic University of Ghana
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cug-green"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <Logo variant="dark" />
            </div>
            <h1 className="text-3xl font-black text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
