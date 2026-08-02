import Image from "next/image";
import Link from "next/link";
import { categoryLabel, formatDuration } from "@/lib/film";
import { urlFor } from "@/lib/sanity/image";
import type { Film } from "@/lib/sanity/types";
import { Display } from "./typography";

const THUMBNAIL_WIDTH = 800;
const THUMBNAIL_HEIGHT = 450;
const THUMBNAIL_QUALITY = 80;
const SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/**
 * Mux always generates a poster from the video itself, so a film without a
 * hand-picked Sanity `thumbnail` still gets a real frame rather than a blank
 * box — see SPEC.md §3. No LQIP exists for it, so no blur placeholder here,
 * unlike the Sanity-sourced branch below.
 */
function muxPosterUrl(playbackId: string) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${THUMBNAIL_WIDTH}&height=${THUMBNAIL_HEIGHT}&fit_mode=smartcrop`;
}

/**
 * DESIGN.md §9: "Duration badge, title, category" on a YouTube-style card.
 * A real `<Link>` (not a click handler) so it participates in Phase 9b's
 * intercepting route the normal way — soft navigation to `/portfolio/videos/[slug]`.
 */
export function VideoCard({ film }: { film: Film }) {
  const duration = film.duration ? formatDuration(film.duration) : null;

  return (
    <Link
      href={`/portfolio/videos/${film.slug}`}
      className="ring-focus-ring rounded-control group block touch-manipulation outline-none focus-visible:ring-2"
    >
      <div className="rounded-control bg-surface relative aspect-video overflow-hidden">
        <Image
          src={
            film.thumbnail
              ? urlFor(film.thumbnail)
                  .width(THUMBNAIL_WIDTH)
                  .quality(THUMBNAIL_QUALITY)
                  .url()
              : muxPosterUrl(film.playbackId)
          }
          alt={film.thumbnail?.alt ?? film.title}
          fill
          sizes={SIZES}
          className="object-cover transition-opacity group-hover:opacity-90"
          {...(film.thumbnail
            ? {
                placeholder: "blur" as const,
                blurDataURL: film.thumbnail.asset.metadata.lqip,
              }
            : {})}
        />
        {duration ? (
          <span className="rounded-control bg-overlay text-text-primary absolute right-2 bottom-2 px-1.5 py-0.5 font-mono text-xs">
            {duration}
          </span>
        ) : null}
      </div>
      <div className="mt-3 space-y-1">
        <Display as="h3" className="text-text-primary text-xl md:text-2xl">
          {film.title}
        </Display>
        <p className="text-text-accent font-mono text-xs tracking-widest uppercase">
          {categoryLabel(film.category)}
        </p>
      </div>
    </Link>
  );
}
