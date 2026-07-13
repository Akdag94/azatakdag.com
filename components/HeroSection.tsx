"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useLang } from "@/context/LanguageContext";

const SVG_NS = "http://www.w3.org/2000/svg";

// Gerçekçi yıldırım: kökten uca rastgele yürüyüşle üretilen çok segmentli
// ana kanal + ondan ayrılan ince dallar. Çizim stroke-dash ile kökten uca
// "akarak" ilerler — elektriğin gidişi.
function generateBolt(xStart: number, targetY: number) {
  const main: [number, number][] = [[xStart, -40]];
  let x = xStart;
  let y = -40;
  while (y < targetY) {
    y += 10 + Math.random() * 20;
    x += (Math.random() - 0.5) * 42 + (Math.random() < 0.14 ? (Math.random() - 0.5) * 95 : 0);
    main.push([x, y]);
  }

  const branches: [number, number][][] = [];
  const forkCount = 2 + Math.floor(Math.random() * 3);
  for (let f = 0; f < forkCount; f++) {
    const idx = 3 + Math.floor(Math.random() * (main.length - 6));
    let [bx, by] = main[idx];
    const dir = Math.random() < 0.5 ? -1 : 1;
    const pts: [number, number][] = [[bx, by]];
    const steps = 3 + Math.floor(Math.random() * 5);
    for (let s = 0; s < steps; s++) {
      bx += dir * (8 + Math.random() * 26);
      by += 6 + Math.random() * 18;
      pts.push([bx, by]);
    }
    branches.push(pts);
  }
  return { main, branches };
}

const toPathD = (pts: [number, number][]) =>
  "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");

function makePath(d: string, stroke: string, width: number) {
  const p = document.createElementNS(SVG_NS, "path");
  p.setAttribute("d", d);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", stroke);
  p.setAttribute("stroke-width", String(width));
  p.setAttribute("stroke-linejoin", "round");
  p.setAttribute("stroke-linecap", "round");
  return p;
}

// Katman düzeni (alttan üste):
//   z-0  orman zemini
//   z-10 İSİM — ağaçların ARKASINDA; harfler ağaçların arasından yükselir
//   z-20 ön ağaç katmanı (alfa silüetler) → 3D derinlik
//   z-30 roller/alt yazılar + ipucu
//   z-40 şimşekler
//   z-50 finalde inen sis/bulut örtüsü
export function HeroSection() {
  const { t, lang } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const introPlayed = useRef(false);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const isAr = lang === "ar";
      const title = section.querySelector<HTMLElement>("[data-hero-title]");
      const bg = section.querySelector<HTMLElement>("[data-hero-bg]");
      const front = section.querySelector<HTMLElement>("[data-hero-front]");
      const lightning = section.querySelector<HTMLElement>("[data-lightning]");
      const skyGlow = section.querySelector<HTMLElement>("[data-sky-glow]");
      const boltSvg = section.querySelector<SVGSVGElement>("[data-bolt-svg]");
      if (!title || !bg) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          full: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 768px)",
        },
        (ctx) => {
          const { full } = ctx.conditions as { full: boolean; desktop: boolean };
          if (!full) {
            // reduce: statik sahne — CSS ile gizli başlayan metinleri aç.
            gsap.set([title, ...section.querySelectorAll("[data-hero-fade]")], { opacity: 1 });
            return;
          }

          const { desktop } = ctx.conditions as { desktop: boolean };

          // Maskesiz böl: kutu görünümü yok, ağaçlar doğal örter.
          const split = SplitText.create(title, { type: isAr ? "words" : "chars" });
          const pieces = isAr ? split.words : split.chars;

          // Ambiyans sisleri.
          section.querySelectorAll<HTMLElement>("[data-fog]").forEach((fog, i) => {
            gsap.to(fog, {
              xPercent: i % 2 === 0 ? 14 : -14,
              duration: 24 + i * 8,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          });

          // Ken Burns — ön katman daha güçlü (derinlik).
          gsap.fromTo(bg, { scale: 1.05 }, { scale: 1.1, duration: 26, ease: "sine.inOut", yoyo: true, repeat: -1 });
          if (front) {
            gsap.fromTo(front, { scale: 1.07 }, { scale: 1.14, duration: 26, ease: "sine.inOut", yoyo: true, repeat: -1 });
          }

          // Açılış: sahne loş başlayıp hızla aydınlanır — siyah ekran hissi
          // vermeyecek kadar kısa ve parlak.
          if (!introPlayed.current) {
            introPlayed.current = true;
            gsap.fromTo(
              [bg, front].filter(Boolean),
              { filter: "brightness(0.45) blur(4px)" },
              { filter: "brightness(1) blur(0px)", duration: 1.2, ease: "power2.out" }
            );
            gsap.from("[data-hero-hint]", { opacity: 0, duration: 1, delay: 0.8 });
          }

          // Başlangıç durumları. Başlık CSS'te opacity-0 başlar (hydration
          // öncesi flaşı önler); harfler konumlandıktan sonra görünür yapılır.
          // Mobilde ön ağaç katmanı aşağı kaymış harfleri örtemediğinden
          // harfler şeffaf başlar, yükselirken belirir.
          gsap.set(pieces, { yPercent: 135, autoAlpha: desktop ? 1 : 0 });
          gsap.set(title, { opacity: 1 });
          const fades = section.querySelectorAll("[data-hero-fade]");
          gsap.set(fades, { opacity: 0, y: 24 });
          const words = gsap.utils.toArray<HTMLElement>(section.querySelectorAll("[data-hero-role]"));
          gsap.set(words.slice(1), { yPercent: 112 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: desktop ? "+=280%" : "+=200%",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
            },
          });

          // 1) İpucu kaybolur.
          tl.to("[data-hero-hint]", { opacity: 0, y: -20, duration: 0.05 }, 0);

          // 2) Harfler ağaçların arasından tek tek yükselir.
          tl.to(pieces, { yPercent: 0, autoAlpha: 1, duration: 0.14, stagger: 0.02, ease: "power2.out" }, 0.05);

          // 3) Şimşekler: her biri o an üretilen benzersiz, çok segmentli
          //    kanal — kökten uca akarak çizilir, dalları gecikmeli ayrılır,
          //    titreyip söner. Flaş, kanal ucuna vardığı anda patlar.
          if (lightning && skyGlow && boltSvg) {
            const strike = (at: number, power: number, xStart: number) => {
              const { main, branches } = generateBolt(xStart, 480 + Math.random() * 120);
              const group = document.createElementNS(SVG_NS, "g");
              group.setAttribute(
                "style",
                "opacity:0;filter:drop-shadow(0 0 5px rgba(205,225,255,0.95)) drop-shadow(0 0 22px rgba(150,185,255,0.55))"
              );
              const glow = makePath(toPathD(main), "rgba(175,205,255,0.4)", 8);
              const core = makePath(toPathD(main), "#f4f8ff", 2.4);
              group.appendChild(glow);
              group.appendChild(core);
              const branchPaths = branches.map((b) => {
                const bp = makePath(toPathD(b), "#d9e6ff", 1.1);
                group.appendChild(bp);
                return bp;
              });
              boltSvg.appendChild(group);

              // dash hazırlığı: her yol kendi uzunluğu kadar gizli başlar.
              [glow, core, ...branchPaths].forEach((p) => {
                const len = p.getTotalLength();
                p.style.strokeDasharray = String(len);
                p.style.strokeDashoffset = String(len);
              });

              const DRAW = 0.016; // ana kanalın kökten uca iniş süresi (progress)

              tl.set(group, { opacity: 1 }, at);
              tl.to([glow, core], { strokeDashoffset: 0, duration: DRAW }, at);
              branchPaths.forEach((bp, i) => {
                // dal, ana kanal kendi çatal noktasını geçtikten hemen sonra akar
                tl.to(bp, { strokeDashoffset: 0, duration: DRAW * 0.45 }, at + DRAW * (0.35 + i * 0.18));
              });
              // titreme: iki hızlı sönüp parlama, sonra sönüş
              tl.to(group, { opacity: 0.35, duration: 0.005 }, at + DRAW + 0.004)
                .to(group, { opacity: 1, duration: 0.004 }, at + DRAW + 0.01)
                .to(group, { opacity: 0, duration: 0.028 }, at + DRAW + 0.02);

              // uç noktaya varış anında gök ve sahne patlar
              const hitAt = at + DRAW * 0.9;
              tl.fromTo(lightning, { opacity: 0 }, { opacity: power, duration: 0.01 }, hitAt)
                .to(lightning, { opacity: 0, duration: 0.012 }, hitAt + 0.011)
                .fromTo(lightning, { opacity: 0 }, { opacity: power * 0.6, duration: 0.007 }, hitAt + 0.026)
                .to(lightning, { opacity: 0, duration: 0.02 }, hitAt + 0.034);
              tl.fromTo(skyGlow, { opacity: 0 }, { opacity: 0.85, duration: 0.012 }, at)
                .to(skyGlow, { opacity: 0, duration: 0.05 }, hitAt + 0.02);
              tl.fromTo(
                [bg, front].filter(Boolean),
                { filter: "brightness(1)" },
                { filter: "brightness(1.85) saturate(0.82)", duration: 0.012 },
                hitAt
              ).to([bg, front].filter(Boolean), { filter: "brightness(1) saturate(1)", duration: 0.045 }, hitAt + 0.013);
            };

            strike(0.37, 0.8, 300 + Math.random() * 250);
            strike(0.45, 1, 850 + Math.random() * 300);
          }

          // 4) Yazılar belirir, rol kelimeleri akar.
          tl.to(fades, { opacity: 1, y: 0, duration: 0.08, stagger: 0.02, ease: "power2.out" }, 0.53);
          tl.to(words[0], { yPercent: -112, duration: 0.06 }, 0.61)
            .to(words[1], { yPercent: 0, duration: 0.06 }, 0.61)
            .to(words[1], { yPercent: -112, duration: 0.06 }, 0.69)
            .to(words[2], { yPercent: 0, duration: 0.06 }, 0.69);

          // 5) Yoğun sis örtüsü katman katman iner; sahne kararmadan
          //    onunla birlikte aşağı süzülürüz.
          const mists = gsap.utils.toArray<HTMLElement>(section.querySelectorAll("[data-mist]"));
          mists.forEach((m, i) => {
            tl.fromTo(
              m,
              { yPercent: -130, xPercent: i % 2 === 0 ? -6 : 6 },
              { yPercent: 30 + i * 8, xPercent: i % 2 === 0 ? 4 : -4, duration: 0.27 - i * 0.02, ease: "power1.in" },
              0.73 + i * 0.03
            );
          });
          tl.to(bg, { yPercent: 9, duration: 0.24 }, 0.76);
          if (front) tl.to(front, { yPercent: 20, duration: 0.24 }, 0.76);
          tl.to("[data-hero-titlewrap], [data-hero-content]", { yPercent: -18, opacity: 0, duration: 0.2 }, 0.82);

          return () => {
            if (boltSvg) boltSvg.innerHTML = "";
          };
        }
      );
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* z-0: orman zemini */}
      <div data-hero-bg className="absolute inset-0 z-0 scale-[1.05] will-change-transform">
        <Image src="/forest-hero.webp" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-[#020504]" />
      </div>

      {/* z-10: isim — ağaçların arkasında */}
      <div data-hero-titlewrap className="absolute inset-x-0 top-[24%] z-10 px-6 text-center md:top-[22%]">
        <h1
          key={lang} // SplitText DOM'u böldüğünden dil değişiminde sıfırdan kurulmalı
          data-hero-title
          className="text-white font-extrabold leading-[0.95] tracking-tighter opacity-0"
          style={{ fontSize: "clamp(2.5rem, 12vw, 11rem)" }}
        >
          {t.hero.title1} {t.hero.title2}
        </h1>
      </div>

      {/* z-20: ön ağaç katmanı — isim bunun arkasından yükselir */}
      <div data-hero-front className="pointer-events-none absolute inset-0 z-20 scale-[1.07] will-change-transform">
        <Image src="/forest-front.webp" alt="" fill priority sizes="100vw" className="object-cover" />
      </div>

      {/* Ambiyans sisleri */}
      <div
        data-fog
        aria-hidden
        className="pointer-events-none absolute -inset-x-1/3 bottom-[-8vh] z-20 h-[48vh] bg-[radial-gradient(ellipse_at_center,rgba(205,235,220,0.15),transparent_62%)] blur-3xl"
      />
      <div
        data-fog
        aria-hidden
        className="pointer-events-none absolute -inset-x-1/4 top-[16vh] z-20 h-[38vh] bg-[radial-gradient(ellipse_at_center,rgba(170,215,195,0.09),transparent_65%)] blur-3xl"
      />

      {/* z-30: roller + alt yazılar */}
      <div
        data-hero-content
        className="absolute inset-x-0 top-[56%] z-30 flex w-full flex-col items-center px-6 text-center md:top-[58%]"
      >
        <div
          className="relative h-[1.5em] w-full overflow-hidden text-2xl font-semibold text-emerald-100/90 opacity-0 md:text-4xl"
          data-hero-fade
          aria-label={t.hero.roles.join(" ")}
        >
          {t.hero.roles.map((role, i) => (
            <span
              key={role}
              data-hero-role
              className="absolute inset-0 flex items-center justify-center will-change-transform"
              style={i > 0 ? { transform: "translateY(112%)" } : undefined}
            >
              {role}
            </span>
          ))}
        </div>
        <p data-hero-fade className="mt-6 max-w-xl text-base font-light text-neutral-200 opacity-0 md:text-lg" style={{ textShadow: "0 2px 18px rgba(0,0,0,0.8)" }}>
          {t.hero.subtitle}
        </p>
        <p data-hero-fade className="mt-3 max-w-lg text-sm text-neutral-300 opacity-0" style={{ textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}>
          {t.hero.description}
        </p>
      </div>

      {/* z-40: şimşek flaşı + gök parlaması + prosedürel yıldırım kanalları */}
      <div
        data-lightning
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 opacity-0 mix-blend-screen"
        style={{
          background:
            "linear-gradient(160deg, rgba(220,235,255,0.95) 0%, rgba(160,200,255,0.5) 35%, transparent 70%)",
        }}
      />
      <div
        data-sky-glow
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-40 h-[55vh] opacity-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% -20%, rgba(190,215,255,0.85), rgba(120,160,255,0.25) 45%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />
      <svg
        data-bolt-svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMin slice"
      />

      {/* z-50: finalde inen yoğun sis örtüsü */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          data-mist
          aria-hidden
          className="pointer-events-none absolute inset-x-[-20%] top-0 z-50 h-[110vh] will-change-transform"
          style={{
            transform: "translateY(-130%)",
            background:
              i === 0
                ? "radial-gradient(55% 42% at 28% 55%, rgba(228,238,233,0.85), rgba(228,238,233,0.3) 55%, transparent 74%), radial-gradient(48% 40% at 72% 38%, rgba(222,234,228,0.75), transparent 70%)"
                : i === 1
                  ? "radial-gradient(60% 45% at 62% 60%, rgba(232,240,236,0.8), rgba(232,240,236,0.28) 58%, transparent 76%), radial-gradient(45% 38% at 20% 35%, rgba(218,230,224,0.7), transparent 68%)"
                  : "radial-gradient(70% 50% at 45% 45%, rgba(236,243,239,0.9), rgba(236,243,239,0.35) 60%, transparent 78%)",
            filter: `blur(${26 + i * 10}px)`,
          }}
        />
      ))}

      {/* İpucu */}
      <div
        data-hero-hint
        className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-300">
          {t.hero.scrollHint}
        </span>
        <ArrowDown className="h-4 w-4 animate-bounce text-neutral-400" />
      </div>
    </section>
  );
}
