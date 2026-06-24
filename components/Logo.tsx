"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Tone of the accompanying text. Use "light" on dark backgrounds. */
  variant?: "light" | "dark";
  /** Hide the text labels and show only the logo mark. */
  markOnly?: boolean;
  href?: string;
  className?: string;
}

/**
 * CUG logo lockup. Drop a `logo.png` (or `logo.svg`) into /public and it will
 * appear automatically; until then a branded placeholder is shown.
 */
export function Logo({
  variant = "dark",
  markOnly = false,
  href = "/",
  className,
}: LogoProps) {
  const [imgOk, setImgOk] = useState(true);
  const light = variant === "light";

  const mark = (
    <span
      className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5"
      data-no-translate
      aria-label="Catholic University of Ghana logo"
    >
      {imgOk ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/logo.jpg"
          alt="Catholic University of Ghana"
          className="h-full w-full object-contain p-1"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="text-sm font-extrabold tracking-tight text-[var(--cug-green)]">
          CUG
        </span>
      )}
    </span>
  );

  const content = (
    <span className={cn("flex items-center gap-3", className)}>
      {mark}
      {!markOnly && (
        <span className="flex flex-col leading-tight" data-no-translate>
          <span
            className={cn(
              "text-sm font-bold tracking-tight sm:text-base",
              light ? "text-white" : "text-foreground",
            )}
          >
            Catholic University of Ghana
          </span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider",
              light ? "text-white/70" : "text-muted-foreground",
            )}
          >
            Students Wellfare Portal
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
