"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SiteSettings } from "@/lib/sanity/types";
import { Display, Eyebrow } from "./typography";

/**
 * DESIGN.md §8.1: silent, looped, autoplaying, no controls, not clickable —
 * pure atmosphere. Full height on desktop, stopping short on tablet/phone so
 * the next section peeks up. `-mt-20` cancels layout.tsx's `pt-20` (which
 * clears the fixed header on every other page) so the loop runs full-bleed
 * under the transparent header.
 *
 * The video and the poster <Image> are both always in the DOM; which one is
 * visible is decided by CSS for the `prefers-reduced-motion` case (the
 * `motion-reduce:`/`motion-safe:` variants) and by `autoplayBlocked` state
 * for the "motion is fine but the browser wouldn't autoplay anyway" case
 * (Phase 12e) — Safari Low Power Mode, some in-app browsers, and similar
 * are real, not hypothetical, and previously left the section showing an
 * empty scrim over nothing rather than the poster. `autoplayBlocked`
 * starts `false` on both server and initial client render (matching), so
 * there's no hydration mismatch — it can only flip after mount, once the
 * `play()` promise settles.
 *
 * The sunrise warm-up device from DESIGN.md §3 is deferred post-MVP — see
 * the note there for the implementation approach if it comes back.
 */
export function Hero({ settings }: { settings: SiteSettings | null }) {
  const name = settings?.name ?? "Oros Productions";
  const tagline = settings?.tagline;
  const videoUrl = settings?.heroVideoUrl;
  const poster = settings?.heroPoster;
  const posterUrl = poster ? urlFor(poster).width(1920).quality(80).url() : undefined;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setAutoplayBlocked(true));
  }, []);

  const videoVisible = Boolean(videoUrl && posterUrl) && !autoplayBlocked;

  return (
    <section className="relative -mt-20 h-[80svh] w-full overflow-hidden md:h-[85svh] lg:h-svh">
      {videoUrl && posterUrl ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover motion-reduce:hidden ${
            autoplayBlocked ? "hidden" : ""
          }`}
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : null}

      {posterUrl ? (
        <Image
          src={posterUrl}
          alt=""
          fill
          preload
          sizes="100vw"
          placeholder={poster?.asset.metadata.lqip ? "blur" : "empty"}
          blurDataURL={poster?.asset.metadata.lqip}
          className={`object-cover ${videoVisible ? "hidden motion-reduce:block" : ""}`}
        />
      ) : (
        <div className="absolute inset-0 bg-app-bg" />
      )}

      <div className="scrim absolute inset-0" />

      <div className="relative z-10 flex h-full flex-col items-center justify-end gap-3 px-6 pb-16 text-center md:pb-24">
        <Display size="xl" className="text-text-primary">
          {name}
        </Display>
        {tagline ? (
          <Eyebrow tone="secondary" size="md">
            {tagline}
          </Eyebrow>
        ) : null}
      </div>
    </section>
  );
}
