"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";

const SIZES = "(min-width: 1024px) 340px, (min-width: 640px) 260px, 50vw";
const FILLER_COUNT = 5;

/**
 * A real CSS Flexbox rule, not a workaround for a bug: per spec (§9.7 step
 * 6b), when the *sum* of flex-grow factors on a line is less than 1, the
 * browser only distributes that sum's fraction of the leftover space and
 * leaves the rest empty — it does not clamp up to "give everything away."
 * A single portrait photo (aspectRatio < 1, e.g. 0.75) used directly as
 * flex-grow is exactly this case whenever it's alone on a line, which on
 * mobile (one item per row) is the common case, not an edge case — the row
 * visibly stopped short of the container's full width. Multiplying every
 * item's flex-grow by the same large constant leaves every line's relative
 * proportions identical (flex-grow is only ever compared against siblings
 * on the same line) while guaranteeing the sum is always comfortably >1.
 */
const FLEX_GROW_SCALE = 1000;

export type JustifiedGridItem = {
  id: string;
  image: SanityImage;
  alt: string;
  overlay?: ReactNode;
  /** Real navigation (e.g. SelectedWork deep-linking into the portfolio lightbox), not an in-page action — see the `<Link>` vs `<button>` note below. */
  href?: string;
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
 * distorting a lone trailing image — but only where the layout normally
 * puts more than one item per row (sm and up); on mobile, one-per-row *is*
 * the intended layout, not an incomplete one, so a suppressed last item
 * would be the one photo that doesn't reach the same width as every other
 * row. The trailing zero-height filler elements are the standard CSS-only
 * fix for the former — `grow-0` by default so they never compete for
 * space, `sm:grow-[...]` past that breakpoint so they dominate and absorb
 * the leftover growth instead, on whichever row has room for them
 * (harmless no-ops on every row that's already full). If this ever proves
 * insufficient in practice, `react-photo-album` is the named fallback, not
 * a rewrite.
 *
 * Shared between the real portfolio grid (`PhotoGallery`, every item
 * clickable to open the in-page lightbox via the grid-level `onItemClick`)
 * and `SelectedWork`'s featured strip (Phase 12f: each featured photo's
 * item carries its own `href` — `/portfolio/photos?photo=<id>` — deep-
 * linking into the *portfolio's* lightbox via Phase 12e's URL state,
 * since SelectedWork isn't the page that lightbox lives on). Per item,
 * that's the real distinction between the two mechanisms: `href` is
 * navigation to a different page/URL (a real `<a>`, matching how the web
 * expects navigation to work — back button, open-in-new-tab, the works),
 * `onItemClick` is an in-page action with no URL of its own (a `<button>`).
 * An item's own `href` wins if both are somehow available; a plain
 * non-interactive `<div>` renders when neither is — a hover-fade or focus
 * ring on something that does nothing on click/Enter would be a false
 * affordance. Roving Arrow Left/Right focus works the same way regardless
 * of which interactive element a given item rendered as.
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
  const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);

  if (items.length === 0) return null;

  const INTERACTIVE_CLASSES =
    "reveal group touch-manipulation relative min-w-0 cursor-pointer focus-visible:z-10";

  return (
    <div className="flex flex-wrap items-start gap-2 [--row-h:200px] sm:[--row-h:260px] lg:[--row-h:320px]">
      {items.map((item, index) => {
        const { aspectRatio } = item.image.asset.metadata.dimensions;
        const style = {
          flexGrow: aspectRatio * FLEX_GROW_SCALE,
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
        const onKeyDown = (event: React.KeyboardEvent) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            itemRefs.current[index + 1]?.focus();
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            itemRefs.current[index - 1]?.focus();
          }
        };

        if (item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              onKeyDown={onKeyDown}
              className={INTERACTIVE_CLASSES}
              style={style}
            >
              {image}
              {item.overlay}
            </Link>
          );
        }

        if (onItemClick) {
          return (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              onClick={() => onItemClick(index)}
              onKeyDown={onKeyDown}
              className={INTERACTIVE_CLASSES}
              style={style}
            >
              {image}
              {item.overlay}
            </button>
          );
        }

        return (
          <div key={item.id} className="reveal relative min-w-0" style={style}>
            {image}
            {item.overlay}
          </div>
        );
      })}
      {Array.from({ length: FILLER_COUNT }, (_, i) => (
        // `hidden` below sm, not just zero flex-grow: mobile is one photo
        // per row by design, so the last row's lone photo should fill it
        // exactly like every other row does. A flex item with flex-grow: 0
        // still occupies a slot on its line and still gets a `gap` before
        // it — with 3 zero-width fillers landing on the same line, that's
        // 3 gaps eaten for nothing, visibly short-filling the one photo
        // whether the filler itself grows or not. `hidden` removes it from
        // the flex layout entirely, so it costs nothing until sm:block
        // brings it back — where it must stay far larger than any real
        // item's own scaled flex-grow (aspectRatio * FLEX_GROW_SCALE, a few
        // thousand at most) so a filler landing on an incomplete last row
        // still absorbs its leftover growth there.
        <div key={`filler-${i}`} aria-hidden className="hidden h-0 min-w-0 sm:block sm:grow-[999000]" />
      ))}
    </div>
  );
}
