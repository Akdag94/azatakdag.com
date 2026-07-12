"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLang } from "@/context/LanguageContext";

// Drone çekiminden çıkarılmış kare dizisi, scroll'a bağlı olarak canvas'a
// çizilir (Apple ürün sayfası tekniği): kaydırdıkça kamera ormanın üzerinden
// yükselip denizle buluşan ufka ilerler. Video elementinden farklı olarak
// kare kare sarma iOS dahil her yerde pürüzsüzdür.
const DESKTOP = { dir: "/nature/desktop", count: 161 };
const MOBILE = { dir: "/nature/mobile", count: 129 };

function frameSrc(dir: string, i: number) {
  return `${dir}/f-${String(i + 1).padStart(3, "0")}.webp`;
}

export function NatureSection() {
  const { t, lang } = useLang();
  const { nature } = t;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
          if (reduce) {
            // Poster + ilk anlatı cümlesi statik olarak görünür kalsın.
            const first = section.querySelector<HTMLElement>("[data-beat]");
            if (first) gsap.set(first, { opacity: 1 });
            return;
          }

          const canvas = section.querySelector<HTMLCanvasElement>("[data-nature-canvas]");
          const stage = section.querySelector<HTMLElement>("[data-nature-stage]");
          if (!canvas || !stage) return;
          const context = canvas.getContext("2d");
          if (!context) return;

          const { dir, count } = desktop ? DESKTOP : MOBILE;
          const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
          const playhead = { frame: 0 };
          let lastDrawn = -1;

          const dpr = Math.min(window.devicePixelRatio || 1, desktop ? 1.5 : 1);

          const draw = () => {
            // İstenen kare henüz inmediyse, ondan önceki en yakın inmiş kareyi çiz.
            let idx = Math.round(playhead.frame);
            while (idx > 0 && !images[idx]?.complete) idx--;
            const img = images[idx];
            if (!img?.complete || !img.naturalWidth) return;

            const cw = canvas.width;
            const ch = canvas.height;
            const ir = img.naturalWidth / img.naturalHeight;
            const cr = cw / ch;
            let dw: number, dh: number;
            if (cr > ir) {
              dw = cw;
              dh = cw / ir;
            } else {
              dh = ch;
              dw = ch * ir;
            }
            context.clearRect(0, 0, cw, ch);
            context.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
            lastDrawn = idx;
          };

          const resize = () => {
            canvas.width = Math.round(canvas.clientWidth * dpr);
            canvas.height = Math.round(canvas.clientHeight * dpr);
            lastDrawn = -1;
            draw();
          };
          resize();
          const ro = new ResizeObserver(resize);
          ro.observe(canvas);

          // Kareleri sırayla, sınırlı eşzamanlılıkla indir; sıradaki kare
          // o an ekrandaysa gelir gelmez çiz.
          let next = 0;
          const CONCURRENCY = 6;
          const loadNext = () => {
            if (next >= count) return;
            const i = next++;
            const img = new Image();
            img.src = frameSrc(dir, i);
            img.onload = () => {
              if (Math.round(playhead.frame) >= i && lastDrawn < i) draw();
              loadNext();
            };
            img.onerror = loadNext;
            images[i] = img;
          };
          for (let c = 0; c < CONCURRENCY; c++) loadNext();

          // Ana scrub: pin + kare sarma + sinematik giriş/çıkış ve metin beat'leri.
          const beats = gsap.utils.toArray<HTMLElement>(
            section.querySelectorAll("[data-beat]")
          );
          const bars = section.querySelectorAll<HTMLElement>("[data-letterbox]");

          // Pin boyunca deneyim TÜM ekranı kaplar: navbar pin başında gizlenir,
          // pin çözülür çözülmez geri gelir.
          const header = document.querySelector<HTMLElement>("header");

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: desktop ? "+=400%" : "+=300%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              onToggle: (self) => {
                if (!header) return;
                gsap.to(
                  header,
                  self.isActive
                    ? { yPercent: -110, autoAlpha: 0, duration: 0.4, ease: "power2.in", overwrite: "auto" }
                    : { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out", overwrite: "auto" }
                );
              },
            },
          });

          tl.to(playhead, { frame: count - 1, ease: "none", duration: 1, onUpdate: draw }, 0);

          // Sahneye giriş: bulanık ve yakınken netleşip açılır; letterbox kapanır.
          tl.fromTo(
            stage,
            { scale: 1.18, filter: "blur(16px) brightness(0.55)" },
            { scale: 1, filter: "blur(0px) brightness(1)", duration: 0.1, ease: "none" },
            0
          );
          tl.from(bars, { yPercent: (i) => (i === 0 ? -100 : 100), duration: 0.08, ease: "none" }, 0);

          // Anlatı beat'leri: her metin kendi penceresinde belirip kaybolur.
          const windows: [number, number][] = [
            [0.08, 0.3],
            [0.32, 0.52],
            [0.54, 0.74],
            [0.78, 1.0],
          ];
          beats.forEach((beat, i) => {
            const [a, b] = windows[i % windows.length];
            const span = b - a;
            tl.fromTo(
              beat,
              { opacity: 0, y: 36 },
              { opacity: 1, y: 0, duration: span * 0.3, ease: "none" },
              a
            );
            if (b < 1) {
              tl.to(beat, { opacity: 0, y: -28, duration: span * 0.25, ease: "none" }, b - span * 0.25);
            }
          });

          // Karartma yok: manzara parlaklığını koruyarak yukarı kayar,
          // sonraki bölüm hemen devralır.

          return () => {
            ro.disconnect();
          };
        }
      );
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section ref={sectionRef} id="nature" className="relative overflow-hidden bg-black">
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Görüntü sahnesi */}
        <div data-nature-stage className="absolute inset-0 will-change-transform">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/nature/poster.jpg)" }}
          />
          <canvas data-nature-canvas className="absolute inset-0 h-full w-full" />
          {/* Vinyet + okunabilirlik skrimi */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
        </div>

        {/* Sinematik letterbox bantları */}
        <div data-letterbox className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[7vh] bg-black" />
        <div data-letterbox className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[7vh] bg-black" />

        {/* Anlatı katmanı */}
        <div className="relative z-10 flex h-full w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
          <span className="absolute top-[12vh] text-xs font-medium uppercase tracking-[0.35em] text-white/70">
            {nature.tag}
          </span>
          {nature.beats.map((beat) => (
            <p
              key={beat}
              data-beat
              className="absolute max-w-3xl text-2xl font-semibold leading-snug text-white opacity-0 md:text-4xl"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.7), 0 0 60px rgba(0,0,0,0.4)" }}
            >
              {beat}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
