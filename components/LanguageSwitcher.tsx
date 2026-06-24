"use client";

import { Languages, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, translating } = useLanguage();

  return (
    <div data-no-translate>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Change language"
            className={className}
          >
            {translating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
            <span className="ml-1.5 text-xs font-semibold uppercase">
              {lang === "tw" ? "TW" : "EN"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setLang("en")}>
            🇬🇧 English {lang === "en" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLang("tw")}>
            🇬🇭 Twi (Akan) {lang === "tw" && "✓"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
