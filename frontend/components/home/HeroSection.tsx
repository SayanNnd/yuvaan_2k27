"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMotion } from "@/components/effects/useMotion";
import styles from "./HeroSection.module.css";

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

function ComicScene({ src, priority = false }: { src: string; priority?: boolean }) {
  return (
    <div className={styles.scene}>
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 680px) 48vw, 32vw"
        loading="eager"
        fetchPriority={priority ? "high" : "auto"}
      />
    </div>
  );
}

function ComicRail({
  images,
  reverse = false,
  firstRail = false,
}: {
  images: string[];
  reverse?: boolean;
  firstRail?: boolean;
}) {
  return (
    <div className={`${styles.rail}${reverse ? ` ${styles.reverse}` : ""}`}>
      <div className={styles.track}>
        {[0, 1].map((copy) => (
          <div className={styles.sequence} key={copy}>
            {images.map((src, index) => (
              <ComicScene
                key={`${copy}-${index}`}
                src={src}
                priority={firstRail && copy === 0 && index === 0}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const hero = useRef<HTMLElement>(null);
  const { enabled } = useMotion();
  const firstColumn = HERO_IMAGES.slice(0, 3);
  const secondColumn = HERO_IMAGES.slice(3, 6);
  const thirdColumn = HERO_IMAGES.slice(6, 9);

  useEffect(() => {
    const element = hero.current;
    if (!element || !enabled) return;

    let visible = false;
    const update = () => {
      element.dataset.running = String(visible && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });

    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      element.dataset.running = "false";
    };
  }, [enabled]);

  return (
    <section ref={hero} className={styles.hero} aria-labelledby="hero-title" data-running="false">
      <div className={styles.artwork} aria-hidden="true">
        <ComicRail images={firstColumn} firstRail />
        <ComicRail images={secondColumn} reverse />
        <ComicRail images={thirdColumn} />
      </div>
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>CULTURE. CHAOS. CONNECTION.</p>
        <h1 id="hero-title" className={styles.title}>
          <span className={styles.prelude}>ENTER THE</span>
          <span className={styles.brand}>YUVAAN</span>
          <span className={styles.verse}>
            VERSE<span>!</span>
          </span>
        </h1>
        <Link className={styles.explore} href="/events">
          Explore the events <span aria-hidden="true">&#8599;</span>
        </Link>
      </div>
    </section>
  );
}
