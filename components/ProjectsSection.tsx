"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowUpRight, Lock } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { registerShaderMood } from "@/components/cinematic/shader-mood";
import { SectionHeading } from "@/components/cinematic/SectionHeading";
import { useLang } from "@/context/LanguageContext";

const projectMeta = [
  {
    url: "https://greennovatarim.com",
    shortUrl: "greennovatarim.com",
    internal: false,
    image: "/greennova.webp",
    accent: "text-green-400 border-green-400/30",
  },
  {
    url: null,
    shortUrl: null,
    internal: true,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
    accent: "text-blue-400 border-blue-400/30",
  },
  {
    url: "https://azap.online",
    shortUrl: "azap.online",
    internal: false,
    image: "/azap.webp",
    accent: "text-purple-400 border-purple-400/30",
  },
  {
    url: null,
    shortUrl: null,
    internal: false,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop",
    accent: "text-amber-400 border-amber-400/30",
  },
  {
    url: null,
    shortUrl: null,
    internal: false,
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=800&fit=crop",
    accent: "text-cyan-400 border-cyan-400/30",
  },
];

export function ProjectsSection() {
  const { t, lang } = useLang();
  const { projects } = t;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const track = section.querySelector<HTMLElement>("[data-track]");
      const progress = section.querySelector<HTMLElement>("[data-progress]");
      if (!track) return;

      registerShaderMood(section, { intensity: 0.15, yScale: 0.35, distortion: 0.03 });

      const isRTL = document.documentElement.dir === "rtl";
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const getAmount = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const scrollTween = gsap.to(track, {
          x: () => (isRTL ? getAmount() : -getAmount()),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => "+=" + getAmount(),
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        if (progress) {
          gsap.fromTo(
            progress,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              transformOrigin: isRTL ? "right center" : "left center",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => "+=" + getAmount(),
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        // Panel içi görsel parallax'ı — hareket eden track'e göre (containerAnimation).
        // RTL'de yön hesabı güvenilir olmadığından atlanır.
        if (!isRTL) {
          section.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
            const img = panel.querySelector<HTMLElement>("[data-panel-img]");
            if (!img) return;
            gsap.fromTo(
              img,
              { xPercent: -8 },
              {
                xPercent: 8,
                ease: "none",
                scrollTrigger: {
                  containerAnimation: scrollTween,
                  trigger: panel,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              }
            );
          });
        }
      });

      // Mobil ve reduced-motion: dikey yığın, yumuşak fade-up.
      mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
        ScrollTrigger.batch(section.querySelectorAll<HTMLElement>("[data-panel]"), {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { opacity: 0, y: 36 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }
            ),
        });
      });
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section id="projects" ref={sectionRef} className="relative overflow-hidden bg-[#050505]">
      <div className="mx-auto w-full max-w-6xl px-6 pt-24 md:pt-28">
        <SectionHeading
          tag={projects.tag}
          heading={projects.heading}
          description={projects.description}
        />
        <div className="mt-10 hidden h-px w-full bg-white/10 md:block">
          <div data-progress className="h-px w-full bg-white/60" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>

      <div
        data-track
        className="flex w-full flex-col gap-16 px-6 py-16 md:w-max md:flex-row md:flex-nowrap md:items-stretch md:gap-[6vw] md:px-[8vw] md:py-20"
      >
        {projects.items.map((project, i) => {
          const meta = projectMeta[i];
          const number = String(i + 1).padStart(2, "0");
          return (
            <article
              key={project.name}
              data-panel
              className="relative flex w-full shrink-0 flex-col md:w-[min(78vw,1040px)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-10 select-none text-[22vw] font-extrabold leading-none text-white/[0.04] md:-top-16 md:text-[16vw]"
              >
                {number}
              </span>

              <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
                <div>
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.accent}`}>
                      {project.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      {projects.active}
                    </span>
                  </div>

                  <h3 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
                    {project.name}
                  </h3>
                  <p className="mt-5 max-w-lg leading-relaxed text-neutral-400">
                    {project.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {(project.highlights as readonly string[]).map((h) => (
                      <span
                        key={h}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300"
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8">
                    {meta.url ? (
                      <a
                        href={meta.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
                      >
                        {meta.shortUrl}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : meta.internal ? (
                      <span className="inline-flex items-center gap-2 text-sm text-neutral-500">
                        <Lock className="h-3.5 w-3.5" />
                        {projects.internalLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
                  <div data-panel-img className="absolute inset-[-10%]">
                    <Image
                      src={meta.image}
                      alt={project.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
