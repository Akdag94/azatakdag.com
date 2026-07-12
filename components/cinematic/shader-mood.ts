import { gsap, ScrollTrigger } from "@/lib/gsap";
import { shaderState } from "@/lib/shader-state";

interface ShaderMood {
  intensity?: number;
  yScale?: number;
  distortion?: number;
}

// Bölüm viewport ortasını kapladığında arkaplan shader'ının havasını değiştirir.
// useGSAP context'i içinden çağrılmalı ki dil değişiminde otomatik revert olsun.
export function registerShaderMood(trigger: Element, mood: ShaderMood) {
  return ScrollTrigger.create({
    trigger,
    start: "top 50%",
    end: "bottom 50%",
    onToggle: (self) => {
      if (self.isActive) {
        gsap.to(shaderState, {
          ...mood,
          duration: 1.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    },
  });
}
