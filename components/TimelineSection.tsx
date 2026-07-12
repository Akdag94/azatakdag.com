"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { registerShaderMood } from "@/components/cinematic/shader-mood";
import { SectionHeading } from "@/components/cinematic/SectionHeading";
import { useLang } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function TimelineSection() {
  const { t, lang } = useLang();
  const { timeline } = t;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      registerShaderMood(section, { intensity: 0.35, yScale: 0.55, distortion: 0.06 });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const line = section.querySelector<HTMLElement>("[data-line]");
        const list = section.querySelector<HTMLElement>("[data-list]");

        // Omurga: scroll'la yukarıdan aşağı çizilen hat.
        if (line && list) {
          gsap.fromTo(
            line,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              transformOrigin: "top center",
              scrollTrigger: { trigger: list, start: "top 60%", end: "bottom 75%", scrub: true },
            }
          );
        }

        section.querySelectorAll<HTMLElement>("[data-item]").forEach((item, i) => {
          const dot = item.querySelector<HTMLElement>("[data-dot]");
          const card = item.querySelector<HTMLElement>("[data-tl-card]");
          const ghost = item.querySelector<HTMLElement>("[data-ghost]");

          if (dot) {
            gsap.from(dot, {
              scale: 0,
              duration: 0.5,
              ease: "back.out(2.5)",
              scrollTrigger: { trigger: item, start: "top 70%", toggleActions: "play none none reverse" },
            });
          }
          if (card) {
            gsap.from(card, {
              opacity: 0,
              y: 44,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: item, start: "top 72%", toggleActions: "play none none reverse" },
            });
          }
          // Dev hayalet yıl: alternatif hızlarda katman derinliği.
          if (ghost) {
            const speed = i % 2 === 0 ? 0.85 : 1.15;
            gsap.fromTo(
              ghost,
              { y: (1 - speed) * -220 },
              {
                y: (1 - speed) * 220,
                ease: "none",
                scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
              }
            );
          }
        });
      });
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  const isRTL = lang === "ar";

  return (
    <section id="timeline" ref={sectionRef} className="relative overflow-hidden bg-[#050505] px-6 py-24 md:py-36">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          tag={timeline.tag}
          heading={timeline.heading}
          description={timeline.description}
          align="center"
        />

        <div data-list className="relative mt-24">
          <div
            data-line
            aria-hidden
            className={cn(
              "absolute top-0 h-full w-px bg-white/20",
              isRTL ? "right-4 md:right-1/2" : "left-4 md:left-1/2"
            )}
            style={{ transform: "scaleY(0)" }}
          />

          <ol className="flex flex-col">
            {timeline.items.map((item, i) => {
              const first = i % 2 === 0;
              return (
                <li key={item.date} data-item className="relative py-14 md:py-24">
                  <span
                    data-ghost
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-[26vw] font-extrabold leading-none text-white/[0.045] md:text-[13vw]",
                      "start-[15%]",
                      first ? "md:start-auto md:end-[4%]" : "md:start-[4%] md:end-auto"
                    )}
                  >
                    {item.date}
                  </span>

                  <span
                    data-dot
                    aria-hidden
                    className={cn(
                      "absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)]",
                      isRTL
                        ? "right-4 translate-x-1/2 md:right-1/2"
                        : "left-4 -translate-x-1/2 md:left-1/2"
                    )}
                  />

                  <div
                    data-tl-card
                    className={cn(
                      "relative ms-12 md:ms-0 md:w-[42%]",
                      first ? "md:me-auto md:text-end" : "md:ms-auto md:text-start"
                    )}
                  >
                    <span className="text-sm font-semibold tracking-widest text-neutral-500">
                      {item.date}
                    </span>
                    <h3 className="mt-2 text-2xl font-bold text-white md:text-3xl">{item.title}</h3>
                    <p className="mt-3 leading-relaxed text-neutral-400">{item.content}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
