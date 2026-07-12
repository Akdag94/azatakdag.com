"use client";

import { useRef, useState } from "react";
import { Send, Mail, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/ui/brand-icons";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useLang } from "@/context/LanguageContext";
import { socialLinks } from "@/lib/i18n";

const contactHrefs = [
  socialLinks.email,
  socialLinks.github,
  socialLinks.linkedin,
  socialLinks.instagram,
];
const contactIcons = [Mail, GithubIcon, LinkedinIcon, InstagramIcon];

export function ContactSection() {
  const { t, lang } = useLang();
  const { contact } = t;
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", email: "", message: "" });
  };

  useGSAP(
    (_, contextSafe) => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const heading = section.querySelector<HTMLElement>("[data-contact-heading]");
        if (heading) {
          // Kelime bazlı maskeli scrub reveal — Arapça ligatürleri için güvenli.
          const split = SplitText.create(heading, { type: "words", mask: "words" });
          gsap.fromTo(
            split.words,
            { yPercent: 110, rotate: 5 },
            {
              yPercent: 0,
              rotate: 0,
              stagger: 0.12,
              ease: "none",
              scrollTrigger: { trigger: heading, start: "top 88%", end: "top 45%", scrub: true },
            }
          );
        }

        gsap.from(section.querySelectorAll("[data-contact-fade]"), {
          opacity: 0,
          y: 28,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 60%", toggleActions: "play none none reverse" },
        });
      });

      // Magnetik gönder butonu (yalnızca hassas imleçli cihazlar).
      mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const btn = section.querySelector<HTMLElement>("[data-magnetic]");
        if (!btn || !contextSafe) return;

        const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });

        const onMove = contextSafe((e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            xTo(dx * 0.35);
            yTo(dy * 0.35);
          } else {
            xTo(0);
            yTo(0);
          }
        });
        const onLeave = contextSafe(() => {
          xTo(0);
          yTo(0);
        });

        window.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseleave", onLeave);
        return () => {
          window.removeEventListener("mousemove", onMove);
          btn.removeEventListener("mouseleave", onLeave);
        };
      });
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section id="contact" ref={sectionRef} className="relative px-6 py-28 md:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <span data-contact-fade className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
          {contact.tag}
        </span>
        <h2
          key={lang} // SplitText DOM'u böldüğünden dil değişiminde eleman sıfırdan kurulmalı
          data-contact-heading
          className="mt-6 font-extrabold leading-[1.05] tracking-tighter text-white"
          style={{ fontSize: "clamp(2.75rem, 8vw, 7rem)" }}
        >
          {contact.heading}
        </h2>
        <p data-contact-fade className="mt-6 max-w-xl text-lg text-neutral-400">
          {contact.description}
        </p>

        <div className="mt-20 grid grid-cols-1 gap-16 md:grid-cols-2">
          {/* Sol: doğrudan kanallar */}
          <div data-contact-fade className="flex flex-col gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white">{contact.reachOut}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{contact.reachOutDesc}</p>
            </div>
            <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
              {contact.links.map((c, i) => {
                const Icon = contactIcons[i];
                const href = contactHrefs[i];
                return (
                  <a
                    key={c.label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 py-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors group-hover:bg-white/15">
                      <Icon className="h-4.5 w-4.5 text-white" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm text-neutral-500">{c.label}</span>
                      <span className="block font-medium text-white">{c.value}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-neutral-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white rtl:rotate-[270deg]" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Sağ: form */}
          <div data-contact-fade>
            {sent ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-green-400/30 bg-green-400/5 p-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
                <p className="mt-4 text-lg font-semibold text-white">{contact.successTitle}</p>
                <p className="mt-1 text-sm text-neutral-400">{contact.successDesc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-neutral-400">{contact.labels.name}</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={contact.placeholders.name}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-white/30 focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-neutral-400">{contact.labels.email}</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={contact.placeholders.email}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-white/30 focus:outline-none"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-neutral-400">{contact.labels.message}</span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={contact.placeholders.message}
                    className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-white/30 focus:outline-none"
                  />
                </label>
                <div>
                  <button
                    type="submit"
                    data-magnetic
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-8 py-3.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-200"
                  >
                    <Send className="h-4 w-4" />
                    {contact.send}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
