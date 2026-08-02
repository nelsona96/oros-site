"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";

const SIZES = "(min-width: 1024px) 340px, (min-width: 640px) 260px, 50vw";
const FILLER_COUNT = 5;

export type JustifiedGridItem = {
  id: string;
  image: SanityImage;
  alt: string;
  overlay?: ReactNode;
};

/**
 * DESIGN.md §7: justified rows, tight gutters, mixed portrait/landscape
 * without cropping, collapsing to one or two per row on mobile. Pure CSS
 * per SPEC.md §1 — `flex-basis`/`flex-grow` proportional to each item's
 * real aspect ratio (already selected from Sanity's asset metadata), so
 * the browser's own flex-wrap line-breaking does the row math with zero JS
 * and no layout shift.
 *
 * Phase 12d decision gate: each item's box sets the CSS `aspect-ratio`
 * property to its own true ratio rather than locking `height: var(--row-h)`
 * — `object-fit` never has anything to crop, at the cost of rows only
 * approximating `--row-h` rather than matching it exactly (`items-start`
 * keeps each item's own computed height instead of the default `stretch`
 * forcing every item in a row to match the tallest). See the decision
 * gate's comparison, deleted from `app/photo-grid-comparison/` once the
 * call was made.
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
 * Shared between the real portfolio grid (`PhotoGallery`, every item
 * clickable to open the lightbox) and `SelectedWork`'s featured strip
 * (mixed photos and films, nothing clickable yet — deep-linking into the
 * lightbox is Phase 12f). Whether `onItemClick` is passed decides which
 * shape each item renders as: a real `<button>` (keyboard-focusable, roving
 * Arrow Left/Right focus, hover/focus affordances) when there's an action
 * to take, or a plain non-interactive `<div>` when there isn't — a
 * hover-fade or focus ring on something that does nothing on click/Enter
 * would be a false affordance.
 *
 * Each interactive item's accessible name comes from `alt`; the focus ring
 * is a normal (outset) ring, not `ring-inset`: an inset box-shadow paints
 * with the button's own background, a step that happens *before* its
 * children paint — so it was rendering underneath the full-bleed photo and
 * never actually visible. An outset ring draws outside the box entirely,
 * clear of the image regardless of paint order.
 */
export function JustifiedGrid({
  items,
  onItemClick,
}: {
  items: JustifiedGridItem[];
  onItemClick?: (index: number) => void;
}) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-start gap-2 [--row-h:200px] sm:[--row-h:260px] lg:[--row-h:320px]">
      {items.map((item, index) => {
        const { aspectRatio } = item.image.asset.metadata.dimensions;
        const style = {
          flexGrow: aspectRatio,
          flexBasis: `calc(var(--row-h) * ${aspectRatio})`,
          aspectRatio,
        };
        const image = (
          <Image
            src={urlFor(item.image).width(900).quality(80).url()}
            alt={item.alt}
            fill
            sizes={SIZES}
            placeholder="blur"
            blurDataURL={item.image.asset.metadata.lqip}
            className="object-contain transition-opacity group-hover:opacity-90"
          />
        );

        if (!onItemClick) {
          return (
            <div key={item.id} className="reveal relative min-w-0" style={style}>
              {image}
              {item.overlay}
            </div>
          );
        }

        return (
          <button
            key={item.id}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            onClick={() => onItemClick(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                buttonRefs.current[index + 1]?.focus();
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                buttonRefs.current[index - 1]?.focus();
              }
            }}
            className="reveal group touch-manipulation relative min-w-0 cursor-pointer focus-visible:z-10"
            style={style}
          >
            {image}
            {item.overlay}
          </button>
        );
      })}
      {Array.from({ length: FILLER_COUNT }, (_, i) => (
        <div key={`filler-${i}`} aria-hidden className="h-0 min-w-0" style={{ flexGrow: 999 }} />
      ))}
    </div>
  );
}
