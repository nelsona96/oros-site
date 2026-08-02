"use client";

import { useRef } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { Photo } from "@/lib/sanity/types";

const SIZES = "(min-width: 1024px) 340px, (min-width: 640px) 260px, 50vw";
const FILLER_COUNT = 5;

/**
 * DESIGN.md §7: justified rows, tight gutters, mixed portrait/landscape
 * without cropping, collapsing to one or two per row on mobile. Pure CSS
 * per SPEC.md §1 — `flex-basis`/`flex-grow` proportional to each photo's
 * real aspect ratio (already selected from Sanity's asset metadata), so
 * the browser's own flex-wrap line-breaking does the row math with zero JS
 * and no layout shift.
 *
 * `--row-h` is a responsive CSS custom property set on the container (see
 * its classes below) so the target row height changes per breakpoint while
 * each item's `calc(var(--row-h) * aspectRatio)` flex-basis stays pure CSS.
 *
 * Known limitation, accepted per SPEC.md §1: an incomplete last row would
 * otherwise stretch to fill full width like any other row, visibly
 * distorting a lone trailing image. The trailing zero-height filler
 * elements are the standard CSS-only fix — they absorb that leftover
 * growth instead, on whichever row has room for them (harmless no-ops on
 * every row that's already full). If this ever proves insufficient in
 * practice, `react-photo-album` is the named fallback, not a rewrite.
 *
 * Each photo is a real `<button>` (not a div with a click handler bolted
 * on) so it's keyboard-focusable and activates on Enter/Space for free;
 * its accessible name comes from the image's own required alt text. Arrow
 * Left/Right additionally rove focus directly between photos — sequential
 * Tab still works, but stepping through a wall of images one Tab at a time
 * is a slog, and arrow keys are the expected pattern for a grid of peers.
 *
 * The focus ring is a normal (outset) ring, not `ring-inset`: an inset
 * box-shadow paints with the button's own background, which is a step that
 * happens *before* its children paint — so it was rendering underneath the
 * full-bleed photo and never actually visible. An outset ring draws outside
 * the box entirely, clear of the image regardless of paint order.
 */
export function JustifiedGrid({
  photos,
  onPhotoClick,
}: {
  photos: Photo[];
  onPhotoClick: (index: number) => void;
}) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (photos.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 [--row-h:200px] sm:[--row-h:260px] lg:[--row-h:320px]">
      {photos.map((photo, index) => {
        const { aspectRatio } = photo.image.asset.metadata.dimensions;
        return (
          <button
            key={photo._id}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            onClick={() => onPhotoClick(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                buttonRefs.current[index + 1]?.focus();
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                buttonRefs.current[index - 1]?.focus();
              }
            }}
            className="ring-focus-ring reveal group touch-manipulation relative min-w-0 cursor-pointer outline-none focus-visible:z-10 focus-visible:ring-2"
            style={{
              flexGrow: aspectRatio,
              flexBasis: `calc(var(--row-h) * ${aspectRatio})`,
              height: "var(--row-h)",
            }}
          >
            <Image
              src={urlFor(photo.image).width(900).quality(80).url()}
              alt={photo.image.alt ?? ""}
              fill
              sizes={SIZES}
              placeholder="blur"
              blurDataURL={photo.image.asset.metadata.lqip}
              className="object-cover transition-opacity group-hover:opacity-90"
            />
          </button>
        );
      })}
      {Array.from({ length: FILLER_COUNT }, (_, i) => (
        <div key={`filler-${i}`} aria-hidden className="h-0 min-w-0" style={{ flexGrow: 999 }} />
      ))}
    </div>
  );
}
