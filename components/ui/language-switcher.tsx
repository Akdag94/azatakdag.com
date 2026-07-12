"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGS.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-sm text-white transition-colors hover:border-white/15 hover:bg-white/10"
        aria-label="Dil seç"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden text-xs font-medium text-neutral-400 sm:inline">{current.label}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-neutral-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <ul
        className={cn(
          "absolute end-0 top-full z-50 mt-1.5 w-36 origin-top overflow-hidden rounded-xl border border-white/10 bg-black/95 shadow-lg backdrop-blur-md transition-all duration-150",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1.5 scale-95 opacity-0"
        )}
      >
        {LANGS.map((l) => (
          <li key={l.code}>
            <button
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-neutral-200 transition-colors hover:bg-white/10",
                lang === l.code && "bg-white/10 font-medium text-white"
              )}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-white" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
