"use client";

import { useRef } from "react";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/ui/brand-icons";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLang } from "@/context/LanguageContext";
import { useSmoothScroll } from "@/components/cinematic/SmoothScroll";
import { socialLinks } from "@/lib/i18n";

const socials = [
  { href: socialLinks.github, label: "GitHub", Icon: GithubIcon },
  { href: socialLinks.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  { href: socialLinks.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: socialLinks.email, label: "E-posta", Icon: Mail },
];

// Sticky-reveal footer: kapsayıcı yüksekliği footer kadar; içteki footer
// "top: 100vh - h" ile yapışır, son bölüm üzerinden kayarak footer'ı açığa çıkarır.
export function FooterSection() {
  const { t, lang } = useLang();
  const { footer } = t;
  const { scrollTo } = useSmoothScroll();
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const mark = wrap.querySelector<HTMLElement>("[data-watermark]");
        if (mark) {
          gsap.fromTo(
            mark,
            { yPercent: 32, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom bottom", scrub: true },
            }
          );
        }
        gsap.from(wrap.querySelectorAll("[data-footer-fade]"), {
          opacity: 0,
          y: 20,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: wrap, start: "top 92%", toggleActions: "play none none reverse" },
        });
      });
    },
    { scope: wrapRef, dependencies: [lang], revertOnUpdate: true }
  );

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    scrollTo(target);
  };

  return (
    <div ref={wrapRef} className="relative h-[70vh] md:h-[60vh]">
      <footer className="sticky top-[30vh] flex h-[70vh] flex-col justify-between overflow-hidden bg-black px-6 pt-16 md:top-[40vh] md:h-[60vh]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div data-footer-fade className="max-w-sm">
              <p className="text-lg font-semibold text-white">Azat Akdağ</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{footer.tagline}</p>
            </div>

            <div data-footer-fade className="flex flex-col gap-3 text-sm">
              <a
                href="#projects"
                onClick={(e) => handleAnchor(e, "#projects")}
                className="text-neutral-400 transition-colors hover:text-white"
              >
                {footer.projects}
              </a>
              <a
                href="#contact"
                onClick={(e) => handleAnchor(e, "#contact")}
                className="text-neutral-400 transition-colors hover:text-white"
              >
                {footer.contact}
              </a>
            </div>

            <div data-footer-fade className="flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/15"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <p data-footer-fade className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Azat Akdağ. {footer.rights}
          </p>
        </div>

        <div
          data-watermark
          aria-hidden
          className="pointer-events-none mx-auto w-full select-none overflow-hidden text-center"
        >
          <span className="block translate-y-[18%] whitespace-nowrap text-[14vw] font-extrabold leading-none tracking-tighter text-white/[0.05]">
            Azat Akdağ
          </span>
        </div>
      </footer>
    </div>
  );
}
