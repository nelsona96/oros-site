"use client";

import { useEffect, useRef } from "react";

const SESSION_KEY = "oros-hero-warmup";

/**
 * DESIGN.md §3, device 1: the warm-up plays once per session, not on every
 * visit — sessionStorage is the gate, since a page-load-only check would
 * replay it every time client-side nav returns to "/". Skipped entirely
 * under prefers-reduced-motion rather than just visually suppressed, so
 * reduced-motion users never pay for the animation at all.
 *
 * The overlay div always renders (SSR-safe, no hydration mismatch); the
 * effect toggles the animation class imperatively via a ref rather than
 * React state, since this is a one-time sync with browser-only APIs
 * (matchMedia, sessionStorage), not state that should trigger a re-render.
 */
export function HeroWarmup() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    ref.current?.classList.add("animate-sunrise");
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0"
      style={{
        backgroundImage:
          "radial-gradient(ellipse farthest-side at center, transparent 15%, var(--light-solid) 100%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
