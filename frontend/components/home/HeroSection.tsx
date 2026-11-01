"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMotion } from "@/components/effects/useMotion";
import styles from "./HeroSection.module.css";

// Use artwork that remains in main after the branch histories are combined.
export const HERO_IMAGES: string[] = [
  "/spiderman.jpg",
  "/horimiya.webp",
  "/dr doom.jpg",
  "/beserk.jpg",
  "/batman.jpeg",
  "/jojo.jpg",
  "/vagabond.jpg",
  "/superman.jpg",
  "/zoro.jpg",
];

export const HERO_MOTION = {
  desktop: { zoom: 0.14, backgroundShift: 40, titleShift: 16 },
  mobile: { zoom: 0.06, backgroundShift: 18, titleShift: 8 },
};

export function HeroSection() {
  const hero = useRef<HTMLElement>(null);
  const { enabled, toggle } = useMotion();

  useEffect(() => {
    const element = hero.current;
    if (!element || !enabled) return;
    const mobile = matchMedia("(max-width: 680px)");
    let frame = 0;
    let visible = true;
    let height = element.offsetHeight;
    let top = element.getBoundingClientRect().top + window.scrollY;
    const update = () => {
      frame = 0;
      const progress = Math.max(0, Math.min(1, (window.scrollY - top) / height));
      const amount = mobile.matches ? HERO_MOTION.mobile : HERO_MOTION.desktop;
      // Scroll position, not direction: reversing scroll never resets or jumps.
      element.style.setProperty("--comic-scale", String(1.04 + amount.zoom * (1 - progress)));
      element.style.setProperty("--comic-y", `${progress * amount.backgroundShift}px`);
      element.style.setProperty("--title-y", `${-progress * amount.titleShift}px`);
    };
    const schedule = () => { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(update); };
    const activity = () => {
      element.dataset.running = String(visible && !document.hidden);
      if (!visible || document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else schedule();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; activity(); });
    const resize = new ResizeObserver(() => {
      height = element.offsetHeight;
      top = element.getBoundingClientRect().top + window.scrollY;
      schedule();
    });
    observer.observe(element);
    resize.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", activity);
    activity();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect(); resize.disconnect();
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", activity);
      element.dataset.running = "false";
      ["--comic-scale", "--comic-y", "--title-y"].forEach((key) => element.style.removeProperty(key));
    };
  }, [enabled]);

  return (
    <section ref={hero} className={styles.hero} aria-labelledby="hero-title" data-trail-area data-running="false">
      <div className={styles.artwork} aria-hidden="true">
        <div className={styles.depth}>
          <div className={styles.track}>
            {[0, 1].map((copy) => (
              <div className={styles.sequence} key={copy}>
                {HERO_IMAGES.map((src, index) => (
                  <div className={styles.panel} key={src}>
                    <Image src={src} alt="" fill sizes="(max-width: 680px) 280px, 480px"
                      loading="eager" fetchPriority={copy === 0 && index === 0 ? "high" : "auto"} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.topline}><span>IIIT GUWAHATI</span><span>THE 2027 EDITION</span></div>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>CULTURE. CHAOS. CONNECTION.</p>
        <h1 id="hero-title" className={styles.title}>
          <span className={styles.prelude}>ENTER THE</span>
          <span className={styles.brand}>YUVAAN</span>
          <span className={styles.verse}>VERSE<span>!</span></span>
        </h1>
        <Link className={styles.explore} href="/events">
          Explore the events <span aria-hidden="true">&#8599;</span>
        </Link>
      </div>
      <div className={styles.bottomline}>
        <span>FEBRUARY 2027 <span aria-hidden="true">/</span> MAKE SOME NOISE.</span>
        <button type="button" onClick={toggle} aria-pressed={!enabled} className={styles.motion}>
          <span aria-hidden="true">{enabled ? "\u2161" : "\u25B9"}</span>{" "}
          {enabled ? "Pause motion" : "Motion off"}
        </button>
      </div>
    </section>
  );
}
