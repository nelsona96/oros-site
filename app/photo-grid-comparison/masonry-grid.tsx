import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { Photo } from "@/lib/sanity/types";

const SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

/**
 * Candidate B for the Phase 12d decision gate — true masonry via CSS
 * multi-column layout, the same technique `SelectedWork` already uses for
 * its featured strip, extended here to the full portfolio's photo count
 * and category range rather than a small curated subset.
 */
export function MasonryGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
      {photos.map((photo) => (
        <div key={photo._id} className="mb-4 break-inside-avoid">
          <Image
            src={urlFor(photo.image).width(800).quality(80).url()}
            alt={photo.image.alt ?? ""}
            width={photo.image.asset.metadata.dimensions.width}
            height={photo.image.asset.metadata.dimensions.height}
            sizes={SIZES}
            placeholder="blur"
            blurDataURL={photo.image.asset.metadata.lqip}
            className="border-border w-full border"
          />
        </div>
      ))}
    </div>
  );
}
