"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "./useMotion";

// Replace with local transparent character art; no downloaded or licensed component code.
// Array order is the repeating desktop trail order.
export const TRAIL_ASSETS = [
  "/trails/spider-mask.svg",
  "/trails/luffy.svg",
  "/trails/superman.svg",
  "/trails/batman.svg",
  "/trails/wonder-woman.svg",
  "/trails/iron-man.svg",
];
export const TRAIL_SETTINGS = {
  desktop: { max: 8, distance: 64, lifetime: 850, size: 54 },
  touch: { max: 24, distance: 10, lifetime: 1000, size: 42 },
};

type Point = { x: number; y: number };
type Particle = Point & {
  targetX: number; targetY: number; born: number; life: number;
  rotation: number; size: number; drift: number; image: number;
};
const interactive = "a, button, input, select, textarea, nav, [role='dialog'], [data-no-trail]";

export function PointerTrails() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { enabled } = useMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const fine = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const lowPower = navigator.hardwareConcurrency <= 4;
    const images = TRAIL_ASSETS.map((src) => { const img = new Image(); img.src = src; return img; });
    // Bake overlapping, feathered wisps into one small texture. The irregular
    // silhouette reads as fog rather than individual circular particles.
    // No full-screen blur or per-frame gradient allocation is needed.
    const mist = document.createElement("canvas");
    mist.width = mist.height = 128;
    const brush = mist.getContext("2d")!;
    const wisps = [
      { x: 61, y: 66, radius: 47, opacity: .26 },
      { x: 36, y: 59, radius: 30, opacity: .22 },
      { x: 87, y: 52, radius: 32, opacity: .24 },
      { x: 74, y: 83, radius: 30, opacity: .18 },
      { x: 48, y: 39, radius: 26, opacity: .16 },
    ];
    for (const { x, y, radius, opacity } of wisps) {
      const gradient = brush.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(238,245,249,${opacity})`);
      gradient.addColorStop(.4, `rgba(215,230,239,${opacity * .6})`);
      gradient.addColorStop(1, "rgba(200,218,230,0)");
      brush.fillStyle = gradient;
      brush.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    let particles: Particle[] = [];
    let last: Point | null = null;
    let frame = 0;
    let lastDraw = 0;
    let touchId: number | null = null;
    let mode: "desktop" | "touch" = "desktop";
    let sequence = 0;
    let lastEmit = 0;
    let width = innerWidth;
    let height = innerHeight;
    const clear = () => ctx.clearRect(0, 0, width, height);
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      particles = []; last = null; touchId = null; clear();
    };
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, lowPower ? 1 : 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = []; last = null;
    };
    const draw = (now: number) => {
      frame = 0;
      const interval = mode === "touch" || lowPower ? 1000 / 30 : 1000 / 60;
      if (now - lastDraw < interval - 1) { frame = requestAnimationFrame(draw); return; }
      const delta = Math.min(40, now - lastDraw || 16);
      lastDraw = now;
      clear();
      particles = particles.filter((particle) => now - particle.born < particle.life);
      for (const p of particles) {
        const age = (now - p.born) / p.life;
        const ease = 1 - Math.exp(-delta / 65);
        p.x += (p.targetX - p.x) * ease;
        p.y += (p.targetY - p.y) * ease;
        const fade = Math.min(age * 9, 1) * (1 - age) ** (mode === "touch" ? 1.2 : 1.5);
        const size = p.size * (mode === "touch" ? 1 + age * 1.4 : 1 - age * .16);
        ctx.save();
        ctx.translate(p.x + p.drift * age, p.y - age * (mode === "touch" ? 36 : 10));
        ctx.rotate(p.rotation + age * .12);
        ctx.globalAlpha = fade * (mode === "touch" ? 1 : .85);
        if (mode === "touch") {
          // Broad, slightly flattened clouds overlap into a translucent trail;
          // each expands and lifts away from the touch point as it dissipates.
          ctx.drawImage(mist, -size, -size * .75, size * 2, size * 1.5);
        } else {
          const sprite = images[p.image];
          if (sprite.complete && sprite.naturalWidth) ctx.drawImage(sprite, -size / 2, -size / 2, size, size * 1.16);
        }
        ctx.restore();
      }
      if (particles.length) frame = requestAnimationFrame(draw);
    };
    const emit = (point: Point, kind: typeof mode) => {
      if (document.hidden) return;
      if (mode !== kind) { reset(); mode = kind; }
      const settings = TRAIL_SETTINGS[kind];
      const now = performance.now();
      const distance = last ? Math.hypot(point.x - last.x, point.y - last.y) : Infinity;
      if (distance < settings.distance || now - lastEmit < (kind === "touch" ? 28 : 45)) return;
      particles.push({
        x: last && distance < 150 ? last.x : point.x,
        y: last && distance < 150 ? last.y : point.y,
        targetX: point.x, targetY: point.y, born: now, life: settings.lifetime,
        size: settings.size * (.85 + Math.random() * .3),
        rotation: (Math.random() - .5) * .5,
        drift: (Math.random() - .5) * (kind === "touch" ? 42 : 26),
        image: kind === "desktop" ? sequence++ % images.length : 0,
      });
      const cap = lowPower ? Math.min(settings.max, 16) : settings.max;
      if (particles.length > cap) particles.splice(0, particles.length - cap);
      last = point; lastEmit = now;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const mouse = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches || touchId !== null) return;
      const target = event.target as Element;
      if (!target.closest("[data-trail-area]") || target.closest(`${interactive}, h1, p`)) { last = null; return; }
      emit({ x: event.clientX, y: event.clientY }, "desktop");
    };
    // Touch events continue during native scrolling, unlike cancelled Pointer Events.
    // Every listener is passive; we never capture pointers or preventDefault.
    const startTouch = (event: TouchEvent) => {
      if (event.touches.length !== 1 || (event.target as Element).closest(interactive)) { touchId = null; last = null; return; }
      if (mode !== "touch") { reset(); mode = "touch"; }
      const touch = event.touches[0];
      touchId = touch.identifier; last = null;
      emit({ x: touch.clientX, y: touch.clientY }, "touch");
    };
    const moveTouch = (event: TouchEvent) => {
      if (event.touches.length !== 1) { touchId = null; last = null; return; }
      const touch = event.touches[0];
      if (touch.identifier !== touchId) return;
      emit({ x: touch.clientX, y: touch.clientY }, "touch");
    };
    const endTouch = () => { touchId = null; last = null; };
    const visibility = () => { if (document.hidden) reset(); };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", mouse, { passive: true });
    window.addEventListener("touchstart", startTouch, { passive: true });
    window.addEventListener("touchmove", moveTouch, { passive: true });
    window.addEventListener("touchend", endTouch, { passive: true });
    window.addEventListener("touchcancel", endTouch, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reset();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", mouse);
      window.removeEventListener("touchstart", startTouch);
      window.removeEventListener("touchmove", moveTouch);
      window.removeEventListener("touchend", endTouch);
      window.removeEventListener("touchcancel", endTouch);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-trails" />;
}
