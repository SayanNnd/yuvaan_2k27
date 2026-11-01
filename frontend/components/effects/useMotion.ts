"use client";

import { useSyncExternalStore } from "react";

// Shared across the hero and trails; changing this never updates on pointer/scroll events.
let paused = false;
const listeners = new Set<() => void>();
const query = "(prefers-reduced-motion: reduce)";
const snapshot = () => !paused && !window.matchMedia(query).matches;
const serverSnapshot = () => false;
function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => { listeners.delete(listener); media.removeEventListener("change", listener); };
}

export function useMotion() {
  const enabled = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return { enabled, toggle: () => {
    paused = !paused;
    listeners.forEach((listener) => listener());
  } };
}
