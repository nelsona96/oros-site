"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

const SESSION_KEY = "oros-hero-warmup";

/**
 * DESIGN.md §3, device 1: "comes up in brightness and warmth rather than
 * fading in from transparent" — so the media layer (video/poster, passed as
 * children) is never set to opacity < 1. Instead its `filter` ramps from
 * dim/desaturated to normal, which is a literal read of "comes up in
 * brightness" and, as a side effect, keeps the amber glow screening against
 * a dim backdrop instead of the video's own full-brightness colors — which
 * is what was reading as muddy gold instead of amber.
 *
 * Plays once per session — sessionStorage gates it, since a page-load-only
 * check would replay it every time client-side nav returns to "/". Skipped
 * entirely under prefers-reduced-motion rather than just visually
 * suppressed, so reduced-motion users never pay for it at all.
 *
 * Both layers always render (SSR-safe, no hydration mismatch); the effect
 * toggles the animation classes imperatively via refs rather than React
 * state, since this is a one-time sync with browser-only APIs, not state
 * that should trigger a re-render. useLayoutEffect (not useEffect) so the
 * class lands before the browser's next paint — otherwise there's a visible
 * frame of the fully-bright video between hydration and the effect running.
 * This can't close the gap *before* hydration (the server has no way to know
 * session/reduced-motion state without a cookie + middleware, which would
 * make this static route dynamic and fight the caching model in
 * docs/SPEC.md §7 for a sub-second cosmetic detail) — on a slow connection
 * there's still a brief flash of the plain video while JS loads. Accepted
 * tradeoff for an MVP.
 */
export function HeroWarmup({ children }: { children: ReactNode }) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    mediaRef.current?.classList.add("animate-sunrise-media");
    glowRef.current?.classList.add("animate-sunrise-glow");
  }, []);

  return (
    <>
      <div ref={mediaRef} className="absolute inset-0">
        {children}
      </div>
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse farthest-side at center, transparent 15%, var(--light-solid) 100%)",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
