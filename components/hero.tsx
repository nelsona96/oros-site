import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SiteSettings } from "@/lib/sanity/types";
import { Display } from "./typography";
import { HeroWarmup } from "./hero-warmup";

/**
 * DESIGN.md §8.1: silent, looped, autoplaying, no controls, not clickable —
 * pure atmosphere. Full height on desktop, stopping short on tablet/phone so
 * the next section peeks up. `-mt-20` cancels layout.tsx's `pt-20` (which
 * clears the fixed header on every other page) so the loop runs full-bleed
 * under the transparent header.
 *
 * The video and the poster <Image> are both always in the DOM; which one is
 * visible is decided purely by the `motion-reduce:`/`motion-safe:` CSS
 * variants, so reduced-motion users get a still frame with no JS branch and
 * no hydration mismatch risk. Both are wrapped in <HeroWarmup> (a client
 * component taking server-rendered children) so the warm-up's filter ramp
 * applies to the media layer itself — see hero-warmup.tsx.
 */
export function Hero({ settings }: { settings: SiteSettings | null }) {
  const name = settings?.name ?? "Oros Productions";
  const tagline = settings?.tagline;
  const videoUrl = settings?.heroVideoUrl;
  const poster = settings?.heroPoster;
  const posterUrl = poster ? urlFor(poster).width(1920).quality(80).url() : undefined;

  return (
    <section className="relative -mt-20 h-[80svh] w-full overflow-hidden md:h-[85svh] lg:h-svh">
      <HeroWarmup>
        {videoUrl && posterUrl ? (
          <video
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
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
            priority
            sizes="100vw"
            placeholder={poster?.asset.metadata.lqip ? "blur" : "empty"}
            blurDataURL={poster?.asset.metadata.lqip}
            className={`object-cover ${videoUrl ? "hidden motion-reduce:block" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 bg-app-bg" />
        )}
      </HeroWarmup>

      <div className="scrim absolute inset-0" />

      <div className="relative z-10 flex h-full flex-col items-center justify-end gap-3 px-6 pb-16 text-center md:pb-24">
        <Display className="text-5xl text-text-primary md:text-7xl">{name}</Display>
        {tagline ? (
          <p className="font-mono text-xs tracking-widest text-text-secondary uppercase md:text-sm">
            {tagline}
          </p>
        ) : null}
      </div>
    </section>
  );
}
