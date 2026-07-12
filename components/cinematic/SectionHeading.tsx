"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useLang } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  tag: string;
  heading: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

// Maskeli satır reveal'lı ortak bölüm başlığı. Satır bazlı split Arapça
// ligatürleri için de güvenlidir (harf bazlı değil).
export function SectionHeading({
  tag,
  heading,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const h2 = root.querySelector<HTMLElement>("h2");
      if (!h2) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        SplitText.create(h2, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 0.9,
              stagger: 0.09,
              ease: "power3.out",
              scrollTrigger: {
                trigger: h2,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }),
        });

        gsap.from(root.querySelectorAll("[data-sh-fade]"), {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    { scope: rootRef, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <div ref={rootRef} className={cn(align === "center" && "text-center", className)}>
      <span
        data-sh-fade
        className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500"
      >
        {tag}
      </span>
      {/* key: SplitText DOM'u böldüğünden dil değişiminde eleman sıfırdan kurulmalı */}
      <h2 key={lang} className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
        {heading}
      </h2>
      {description ? (
        <p
          data-sh-fade
          className={cn(
            "mt-5 max-w-xl text-neutral-400",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
