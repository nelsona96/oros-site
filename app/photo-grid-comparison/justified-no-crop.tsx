import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { Photo } from "@/lib/sanity/types";

const SIZES = "(min-width: 1024px) 340px, (min-width: 640px) 260px, 50vw";
const FILLER_COUNT = 5;

/**
 * Candidate A for the Phase 12d decision gate — the same flex-wrap
 * justified-row technique as the production `JustifiedGrid`, but without
 * its `height: var(--row-h)` lock: each item's box uses the CSS
 * `aspect-ratio` property (set to the photo's own true ratio) instead, so
 * its rendered height always matches the photo exactly and `object-fit`
 * never has anything to crop. `items-start` keeps each item's own height
 * rather than the default `stretch` forcing every item in a row to match
 * the tallest — the trade this candidate is testing: rows are no longer
 * pixel-identical in height, only approximately justified around
 * `--row-h`, in exchange for zero cropping of any composition.
 */
export function JustifiedNoCrop({ photos }: { photos: Photo[] }) {
  return (
    <div className="flex flex-wrap items-start gap-1 [--row-h:200px] sm:[--row-h:260px] lg:[--row-h:320px]">
      {photos.map((photo) => {
        const { aspectRatio } = photo.image.asset.metadata.dimensions;
        return (
          <div
            key={photo._id}
            className="relative min-w-0"
            style={{
              flexGrow: aspectRatio,
              flexBasis: `calc(var(--row-h) * ${aspectRatio})`,
              aspectRatio,
            }}
          >
            <Image
              src={urlFor(photo.image).width(900).quality(80).url()}
              alt={photo.image.alt ?? ""}
              fill
              sizes={SIZES}
              placeholder="blur"
              blurDataURL={photo.image.asset.metadata.lqip}
              className="object-contain"
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
