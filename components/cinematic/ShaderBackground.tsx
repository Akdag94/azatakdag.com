"use client";

import { useEffect, useRef } from "react";
import { shaderState } from "@/lib/shader-state";

// Sayfanın tamamının arkasında yaşayan akışkan çizgi shader'ı.
// Parametreleri shaderState üzerinden GSAP tween'leriyle sürülür:
// scroll hızı akışkanı çalkalar, bölüm geçişleri intensity'yi değiştirir,
// sayfa ilerlemesi (uScroll) RGB fazlarını kaydırarak paleti süzdürür.
export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.75);

    const vert = `
      attribute vec2 a_position;
      void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    `;
    const frag = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;
      uniform float uIntensity;
      uniform float uScroll;
      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        float d = length(p) * distortion;
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);
        float rp = uScroll * 2.4;
        float gp = uScroll * 3.1;
        float bp = uScroll * 1.7;
        float r = 0.05 / abs(p.y + sin((rx + time + rp) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time + gp) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time + bp) * xScale) * yScale);
        gl_FragColor = vec4(vec3(r, g, b) * uIntensity, 1.0);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "resolution");
    const uTime = gl.getUniformLocation(prog, "time");
    const uXScale = gl.getUniformLocation(prog, "xScale");
    const uYScale = gl.getUniformLocation(prog, "yScale");
    const uDist = gl.getUniformLocation(prog, "distortion");
    const uIntensity = gl.getUniformLocation(prog, "uIntensity");
    const uScroll = gl.getUniformLocation(prog, "uScroll");

    gl.uniform1f(uXScale, 1.0);

    let t = 0;
    let rafId = 0;
    let running = false;

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();

    const renderFrame = () => {
      gl.uniform1f(uTime, t);
      gl.uniform1f(uYScale, shaderState.yScale);
      gl.uniform1f(uDist, shaderState.distortion);
      gl.uniform1f(uIntensity, shaderState.intensity);
      gl.uniform1f(uScroll, shaderState.progress);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const draw = () => {
      t += 0.008 + Math.min(Math.abs(shaderState.velocity) * 0.0004, 0.03);
      renderFrame();
      rafId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!running && !reduce) {
        running = true;
        rafId = requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) renderFrame();
    });
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) {
      renderFrame(); // tek statik kare
    } else {
      start();
    }

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
