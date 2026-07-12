"use client";

import { useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { ScrollTrigger } from "@/lib/gsap";
import { SmoothScroll } from "@/components/cinematic/SmoothScroll";
import { NatureSection } from "@/components/cinematic/NatureSection";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { TimelineSection } from "@/components/TimelineSection";
import { InterestsSection } from "@/components/InterestsSection";
import { ContactSection } from "@/components/ContactSection";
import { FooterSection } from "@/components/FooterSection";

export function SiteWrapper() {
  const { lang } = useLang();

  // Dil değişince metinler (ve SplitText yapıları) yeniden kurulur;
  // layout oturduktan sonra tüm trigger ölçümleri tazelenmeli.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [lang]);

  return (
    <SmoothScroll>
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <TimelineSection />
        <NatureSection />
        <InterestsSection />
        <ContactSection />
      </main>
      <FooterSection />
    </SmoothScroll>
  );
}
