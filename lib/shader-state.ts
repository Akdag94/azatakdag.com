// SmoothScroll'un her karede yazdığı global scroll durumu.
// React state'i değil: re-render tetiklemez. (Interests marquee
// skew'u velocity'den beslenir.)
export const shaderState = {
  /** 0-1 arası tüm sayfa scroll ilerlemesi */
  progress: 0,
  /** Lenis/ScrollTrigger'dan gelen anlık scroll hızı (px/s mertebesinde) */
  velocity: 0,
};
