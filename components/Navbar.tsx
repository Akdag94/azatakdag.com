"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useSmoothScroll } from "@/components/cinematic/SmoothScroll";
import { useLang } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useLang();
  const { scrollTo } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const links = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.projects, href: "#projects" },
    { label: t.nav.timeline, href: "#timeline" },
    { label: t.nav.interests, href: "#interests" },
    { label: t.nav.contact, href: "#contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sayfa ilerlemesini gösteren ince çizgi.
  useGSAP(
    () => {
      const bar = headerRef.current?.querySelector<HTMLElement>("[data-progress-bar]");
      if (!bar) return;
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: document.documentElement.dir === "rtl" ? "right center" : "left center",
          scrollTrigger: { start: 0, end: "max", scrub: true },
        }
      );
    },
    { scope: headerRef }
  );

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(target);
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/10 bg-black/60 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            scrollTo(0);
          }}
          className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-70"
        >
          Azat Akdağ
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => handleAnchor(e, l.href)}
                className="text-sm text-neutral-400 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <button
            className="rounded-md p-2 text-white transition-colors hover:bg-white/10 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobil menü */}
      <div
        className={cn(
          "grid overflow-hidden border-white/10 bg-black/90 backdrop-blur-xl transition-all duration-300 md:hidden",
          open ? "grid-rows-[1fr] border-b" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <ul className="flex flex-col gap-4 px-6 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => handleAnchor(e, l.href)}
                  className="text-sm font-medium text-neutral-300 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        data-progress-bar
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full bg-emerald-300/70"
        style={{ transform: "scaleX(0)" }}
      />
    </header>
  );
}
