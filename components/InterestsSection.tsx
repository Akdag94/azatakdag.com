"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { shaderState } from "@/lib/shader-state";
import { registerShaderMood } from "@/components/cinematic/shader-mood";
import { SectionHeading } from "@/components/cinematic/SectionHeading";
import { useLang } from "@/context/LanguageContext";

export function InterestsSection() {
  const { t, lang } = useLang();
  const { interests } = t;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      registerShaderMood(section, { intensity: 0.45, yScale: 0.6, distortion: 0.07 });

      const isRTL = document.documentElement.dir === "rtl";
      const dir = isRTL ? -1 : 1;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll("[data-marquee-row]")
        );

        // İki dev tipografi bandı zıt yönlerde, scroll'a kilitli kayar.
        rows.forEach((row, i) => {
          const from = i === 0 ? 0 : -12 * dir;
          const to = i === 0 ? -12 * dir : 0;
          gsap.fromTo(
            row,
            { xPercent: from },
            {
              xPercent: to,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });

        // Scroll hızı bantları hafifçe yatırır — canlı, akışkan his.
        if (rows.length) {
          const skewSetters = rows.map((row) =>
            gsap.quickTo(row, "skewX", { duration: 0.4, ease: "power2.out" })
          );
          const tick = () => {
            const v = gsap.utils.clamp(-4, 4, shaderState.velocity * 0.006);
            skewSetters.forEach((set, i) => set(i === 0 ? v : -v));
          };
          gsap.ticker.add(tick);
          return () => gsap.ticker.remove(tick);
        }
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.batch(section.querySelectorAll<HTMLElement>("[data-interest-card]"), {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, y: 32 },
              { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "power3.out" }
            ),
        });
      });
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  const titles = interests.items.map((i) => i.title);

  return (
    <section
      id="interests"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050505] py-24 md:py-36"
    >
      {/* Zıt yönlü dev tipografi bantları */}
      <div className="pointer-events-none mb-20 flex select-none flex-col gap-2 md:mb-28" aria-hidden>
        <div data-marquee-row className="flex w-max flex-nowrap will-change-transform">
          {[...titles, ...titles].map((title, i) => (
            <span
              key={`a-${i}`}
              className="whitespace-nowrap px-6 text-[11vw] font-extrabold leading-none tracking-tight text-white/90 md:text-[6.5vw]"
            >
              {title}
              <span className="px-6 text-white/20">·</span>
            </span>
          ))}
        </div>
        <div data-marquee-row className="flex w-max flex-nowrap will-change-transform">
          {[...titles.slice().reverse(), ...titles.slice().reverse()].map((title, i) => (
            <span
              key={`b-${i}`}
              className="whitespace-nowrap px-6 text-[11vw] font-extrabold leading-none tracking-tight md:text-[6.5vw]"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)", color: "transparent" }}
            >
              {title}
              <span className="px-6" style={{ WebkitTextStroke: "0", color: "rgba(255,255,255,0.2)" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading tag={interests.tag} heading={interests.heading} />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interests.items.map((item) => (
            <div
              key={item.title}
              data-interest-card
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
            >
              <span className="text-3xl">{item.emoji}</span>
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
