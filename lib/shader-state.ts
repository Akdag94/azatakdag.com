// GSAP tarafından yazılan, shader RAF döngüsünün her karede okuduğu
// global durum. React state'i değil: re-render tetiklemez.
export const shaderState = {
  /** 0-1 arası tüm sayfa scroll ilerlemesi */
  progress: 0,
  /** Lenis/ScrollTrigger'dan gelen anlık scroll hızı (px/s mertebesinde) */
  velocity: 0,
  /** Shader parlaklık çarpanı — bölümden bölüme tween'lenir */
  intensity: 1,
  distortion: 0.05,
  yScale: 0.5,
};
