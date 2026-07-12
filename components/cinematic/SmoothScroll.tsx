"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { shaderState } from "@/lib/shader-state";

interface SmoothScrollValue {
  scrollTo: (target: string | number) => void;
}

const SmoothScrollContext = createContext<SmoothScrollValue>({
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;

    if (!reduce && fine) {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);
      lenis.on("scroll", (e: { velocity: number }) => {
        shaderState.velocity = e.velocity ?? 0;
      });
      tickerFn = (time) => lenis!.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
      lenisRef.current = lenis;
    }

    const progressDriver = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        shaderState.progress = self.progress;
        if (!lenis) {
          shaderState.velocity = gsap.utils.clamp(-60, 60, self.getVelocity() / 100);
        }
      },
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      progressDriver.kill();
      if (tickerFn) gsap.ticker.remove(tickerFn);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: string | number) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -64, duration: 1.4 });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
