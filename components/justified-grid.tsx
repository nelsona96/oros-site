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
 */
export function JustifiedGrid({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 [--row-h:200px] sm:[--row-h:260px] lg:[--row-h:320px]">
      {photos.map((photo) => {
        const { aspectRatio } = photo.image.asset.metadata.dimensions;
        return (
          <div
            key={photo._id}
            className="relative min-w-0"
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
              className="object-cover"
            />
          </div>
        );
      })}
      {Array.from({ length: FILLER_COUNT }, (_, i) => (
        <div key={`filler-${i}`} aria-hidden className="h-0 min-w-0" style={{ flexGrow: 999 }} />
      ))}
    </div>
  );
}
