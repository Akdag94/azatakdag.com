"use client";

import { useRef } from "react";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { registerShaderMood } from "@/components/cinematic/shader-mood";
import { SectionHeading } from "@/components/cinematic/SectionHeading";
import { useLang } from "@/context/LanguageContext";

const valueSpeeds = [0.95, 1.06, 0.9, 1.12];

export function AboutSection() {
  const { t, lang } = useLang();
  const { about } = t;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      registerShaderMood(section, { intensity: 0.25, yScale: 0.45, distortion: 0.05 });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rightCol = section.querySelector<HTMLElement>("[data-about-right]");
        const portrait = section.querySelector<HTMLElement>("[data-portrait-img]");

        // Portre: içerik boyunca hafif dikey parallax + siyah-beyazdan renge.
        if (portrait && rightCol) {
          gsap.fromTo(
            portrait,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: { trigger: rightCol, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
          gsap.fromTo(
            portrait,
            { filter: "grayscale(1)" },
            {
              filter: "grayscale(0)",
              ease: "none",
              scrollTrigger: { trigger: rightCol, start: "top 75%", end: "40% center", scrub: true },
            }
          );
        }

        // Manifesto: kelimeler scroll'la aydınlanır (Arapça için de güvenli — kelime bazlı).
        const p1 = section.querySelector<HTMLElement>("[data-manifesto]");
        if (p1) {
          const split = SplitText.create(p1, { type: "words" });
          gsap.fromTo(
            split.words,
            { opacity: 0.14 },
            {
              opacity: 1,
              stagger: 0.35,
              ease: "none",
              scrollTrigger: { trigger: p1, start: "top 75%", end: "bottom 45%", scrub: true },
            }
          );
        }

        // Destek paragrafları: maskeli satır reveal.
        section.querySelectorAll<HTMLElement>("[data-para]").forEach((p) => {
          SplitText.create(p, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 0.8,
                stagger: 0.06,
                ease: "power3.out",
                scrollTrigger: { trigger: p, start: "top 85%", toggleActions: "play none none reverse" },
              }),
          });
        });

        // Yetenek çipleri ve sertifika satırları: batch stagger.
        ScrollTrigger.batch(section.querySelectorAll<HTMLElement>("[data-chip]"), {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, y: 22 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.045, ease: "power3.out" }
            ),
        });
        ScrollTrigger.batch(section.querySelectorAll<HTMLElement>("[data-cert]"), {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, x: lang === "ar" ? 28 : -28 },
              { opacity: 1, x: 0, duration: 0.7, stagger: 0.09, ease: "power3.out" }
            ),
        });

      });

      // Değer kartları: farklı hızlarda nefes alan katman derinliği (yalnızca desktop).
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const valuesRow = section.querySelector<HTMLElement>("[data-values]");
        if (!valuesRow) return;
        section.querySelectorAll<HTMLElement>("[data-value-card]").forEach((card, i) => {
          const speed = valueSpeeds[i % valueSpeeds.length];
          gsap.fromTo(
            card,
            { y: (1 - speed) * -160 },
            {
              y: (1 - speed) * 160,
              ease: "none",
              scrollTrigger: { trigger: valuesRow, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });
      });
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section id="about" ref={sectionRef} className="relative bg-[#050505] px-6 py-24 md:py-36">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading tag={about.tag} heading={about.heading} />

        <div className="mt-16 grid grid-cols-1 gap-14 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          {/* Sticky portre */}
          <div>
            <div className="md:sticky md:top-[14vh]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10">
                <div data-portrait-img className="absolute inset-[-10%]">
                  <Image
                    src="/azat.webp"
                    alt={about.photoAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 35vw"
                    className="object-cover"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 start-0 p-6">
                  <p className="text-lg font-semibold text-white">{about.photoTitle}</p>
                  <p className="text-sm text-neutral-400">{about.photoSubtitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metin kolonu */}
          <div data-about-right className="flex flex-col gap-12">
            {/* key: SplitText DOM'u böldüğünden dil değişiminde elemanlar sıfırdan kurulmalı */}
            <p key={`p1-${lang}`} data-manifesto className="text-xl font-medium leading-relaxed text-white md:text-2xl">
              {about.p1}
            </p>
            <p key={`p2-${lang}`} data-para className="leading-relaxed text-neutral-400">{about.p2}</p>
            <p key={`p3-${lang}`} data-para className="leading-relaxed text-neutral-400">{about.p3}</p>

            <div>
              <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                {about.skillsLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(about.skills as readonly string[]).map((s) => (
                  <span
                    key={s}
                    data-chip
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-neutral-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                {about.certificatesLabel}
              </h3>
              <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
                {about.certificates.map((c) => (
                  <div key={c.name} data-cert className="flex items-start gap-4 py-4">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                    <div className="min-w-0">
                      <p className="font-medium text-white">{c.name}</p>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        {c.org} · {c.date}
                        {c.id ? <span className="text-neutral-600"> · {c.id}</span> : null}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Değer kartları — katmanlı derinlik */}
        <div data-values className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.values.map((v) => (
            <div
              key={v.title}
              data-value-card
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <h4 className="mb-3 text-lg font-semibold text-white">{v.title}</h4>
              <p className="text-sm leading-relaxed text-neutral-400">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
