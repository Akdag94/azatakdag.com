"use client";

import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { registerShaderMood } from "@/components/cinematic/shader-mood";
import { useSmoothScroll } from "@/components/cinematic/SmoothScroll";
import { useLang } from "@/context/LanguageContext";

export function HeroSection() {
  const { t, lang } = useLang();
  const { scrollTo } = useSmoothScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const introPlayed = useRef(false);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const isAr = lang === "ar";
      const title = section.querySelector<HTMLElement>("[data-hero-title]");
      if (!title) return;

      registerShaderMood(section, { intensity: 1, yScale: 0.5, distortion: 0.05 });

      const mm = gsap.matchMedia();

      mm.add(
        {
          full: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 768px)",
        },
        (ctx) => {
          const { full } = ctx.conditions as { full: boolean; desktop: boolean };
          if (!full) return; // reduce: statik hero, animasyon yok

          const { desktop } = ctx.conditions as { desktop: boolean };

          // Arapçada harf bölmek ligatürleri kırar — kelime bazlı böl.
          const split = SplitText.create(title, {
            type: isAr ? "words" : "chars",
            mask: isAr ? "words" : "chars",
          });
          const pieces = isAr ? split.words : split.chars;

          // Giriş: intro ekranının yerini alan açılış sekansı.
          // Yalnızca ilk açılışta oynar; dil değişimi rebuild'lerinde tekrarlanmaz
          // (elemanlar revert sonrası zaten doğal/görünür durumdadır).
          if (!introPlayed.current) {
            introPlayed.current = true;
            gsap
              .timeline({ defaults: { ease: "power4.out" } })
              .from(pieces, { yPercent: 112, duration: 1.15, stagger: 0.032 }, 0.15)
              .from(
                section.querySelectorAll("[data-hero-fade]"),
                { opacity: 0, y: 18, duration: 0.7, stagger: 0.09, ease: "power3.out" },
                0.75
              );
          }

          // Scroll: pinlenmiş scrub sekansı — rol kelimeleri parmakla sarılır.
          const words = gsap.utils.toArray<HTMLElement>(
            section.querySelectorAll("[data-hero-role]")
          );
          gsap.set(words.slice(1), { yPercent: 112 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: desktop ? "+=200%" : "+=120%",
              pin: true,
              scrub: true,
              anticipatePin: 1,
            },
          });

          // fromTo: giriş animasyonu hâlâ oynarken oluşturulduğundan başlangıç
          // değerleri açıkça verilmeli; yoksa scrub o anki opacity:0'ı yakalayıp kilitler.
          tl.fromTo(
            section.querySelectorAll("[data-hero-fade], [data-hero-hint]"),
            { opacity: 1, y: 0 },
            { opacity: 0, y: -24, duration: 0.14, stagger: 0.015, ease: "none", immediateRender: false },
            0
          )
            .to(title, { scale: 0.94, letterSpacing: "0.01em", duration: 0.3, ease: "none" }, 0)
            .to(words[0], { yPercent: -112, duration: 0.18, ease: "none" }, 0.2)
            .to(words[1], { yPercent: 0, duration: 0.18, ease: "none" }, 0.2)
            .to(words[1], { yPercent: -112, duration: 0.18, ease: "none" }, 0.5)
            .to(words[2], { yPercent: 0, duration: 0.18, ease: "none" }, 0.5)
            .to(
              section.querySelector("[data-hero-content]"),
              { yPercent: -14, opacity: 0, duration: 0.22, ease: "none" },
              0.78
            );
        }
      );
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    scrollTo(target);
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div
        data-hero-content
        className="relative z-10 flex w-full max-w-6xl flex-col items-center px-6 text-center"
      >
        <div data-hero-fade className="mb-8 flex items-center justify-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-green-400">
            {t.hero.available}
          </span>
        </div>

        <h1
          key={lang} // SplitText DOM'u böldüğünden dil değişiminde eleman sıfırdan kurulmalı
          data-hero-title
          className="text-white font-extrabold leading-[0.95] tracking-tighter"
          style={{ fontSize: "clamp(2.5rem, 12vw, 11rem)" }}
        >
          {t.hero.title1} {t.hero.title2}
        </h1>

        <div
          className="relative mt-6 h-[1.5em] w-full overflow-hidden text-2xl font-semibold text-white/80 md:text-4xl"
          aria-label={t.hero.roles.join(" ")}
        >
          {t.hero.roles.map((role, i) => (
            <span
              key={role}
              data-hero-role
              className="absolute inset-0 flex items-center justify-center will-change-transform"
              // İlk kelime dışındakiler varsayılan olarak maskenin altında bekler;
              // GSAP koşmadığında (reduced-motion) üst üste binmesinler.
              style={i > 0 ? { transform: "translateY(112%)" } : undefined}
            >
              {role}
            </span>
          ))}
        </div>

        <p data-hero-fade className="mt-8 max-w-xl text-base font-light text-neutral-400 md:text-lg">
          {t.hero.subtitle}
        </p>
        <p data-hero-fade className="mt-3 max-w-lg text-sm text-neutral-500">
          {t.hero.description}
        </p>

        <div data-hero-fade className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#projects"
            onClick={(e) => handleAnchor(e, "#projects")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/20"
          >
            {t.hero.cta}
          </a>
          <a
            href="#contact"
            onClick={(e) => handleAnchor(e, "#contact")}
            className="text-sm text-neutral-400 underline underline-offset-4 transition-colors hover:text-white"
          >
            {t.hero.ctaContact}
          </a>
        </div>
      </div>

      <div
        data-hero-hint
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
          {t.hero.scrollHint}
        </span>
        <ArrowDown className="h-4 w-4 animate-bounce text-neutral-600" />
      </div>
    </section>
  );
}
