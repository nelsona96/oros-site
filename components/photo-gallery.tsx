"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { Category, Photo } from "@/lib/sanity/types";
import { CategoryFilter } from "./category-filter";
import { Icon } from "./icon";
import { JustifiedGrid } from "./justified-grid";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog";

const LIGHTBOX_IMAGE_WIDTH = 1800;
const LIGHTBOX_IMAGE_QUALITY = 85;

function lightboxImageUrl(photo: Photo) {
  return urlFor(photo.image).width(LIGHTBOX_IMAGE_WIDTH).quality(LIGHTBOX_IMAGE_QUALITY).url();
}

/** DESIGN.md §5: "NIKON Z8 · 85MM · ƒ1.4 · 1/200" — mono, only the fields actually present. */
function formatCapture(capture: Photo["capture"]) {
  if (!capture) return null;
  const parts = [capture.camera, capture.lens, capture.aperture, capture.shutter].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

const SWIPE_THRESHOLD_PX = 50;

/** A ring-only spinner, not another lucide icon — DESIGN.md §6 enumerates the whole site's icon set and this isn't in it. */
function Spinner() {
  return (
    <div role="status" className="absolute inset-0 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-secondary/30 border-t-text-accent" />
      <span className="sr-only">Loading photo…</span>
    </div>
  );
}

/**
 * One persistent layer per photo, stacked and cross-faded by opacity —
 * never remounted by navigation. A `key`-remount-per-active-photo approach
 * (what this replaces) resets React state on every prev/next, so even a
 * photo the browser had fully cached still had to redo its onLoad/decode
 * microtask from scratch — a spinner flash on *every* navigation,
 * including revisiting a photo you'd already viewed a second ago. Here,
 * `loaded` is set once per photo and never reset, because the component
 * instance itself never goes away for the life of the open lightbox —
 * only its opacity toggles. First view of a given photo may show the
 * spinner briefly if it hasn't finished loading; every view after that is
 * instant.
 */
function LightboxPhotoLayer({ photo, active }: { photo: Photo; active: boolean }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Image
        src={lightboxImageUrl(photo)}
        alt={photo.image.alt ?? ""}
        fill
        sizes="100vw"
        preload
        onLoad={() => setLoaded(true)}
        aria-hidden={!active}
        className={`absolute inset-0 object-contain transition-opacity duration-200 ${
          active && loaded ? "opacity-100" : "opacity-0"
        } ${active ? "" : "pointer-events-none"}`}
      />
      {/* After the Image in DOM order, not before — an inactive/still-loading
          layer's Spinner must paint on top of its own (invisible but still
          box-occupying) image, not underneath it. */}
      {active && !loaded ? <Spinner /> : null}
    </>
  );
}

/**
 * Photos are this site's primary content, not an incidental gallery — per
 * explicit direction, every photo's full-size lightbox image is preloaded
 * up front (all of them, not just the open one or its neighbors) rather
 * than only starting to fetch on navigation, even at the cost of a heavier
 * initial page load. `getImageProps` is Next's documented API for exactly
 * this: computing the props next/image would use without mounting a
 * component, so these <link rel="preload"> hints carry the *same*
 * srcSet/URL LightboxPhotoLayer requests later and the browser serves it
 * from cache instead of refetching. React hoists <link> tags rendered
 * anywhere in the tree into <head> automatically.
 */
function LightboxPreloadLinks({ photos }: { photos: Photo[] }) {
  return (
    <>
      {photos.map((photo) => {
        const { props } = getImageProps({
          src: lightboxImageUrl(photo),
          alt: "",
          fill: true,
          sizes: "100vw",
        });
        return (
          <link
            key={photo._id}
            rel="preload"
            as="image"
            href={props.src}
            imageSrcSet={props.srcSet}
            imageSizes={props.sizes}
          />
        );
      })}
    </>
  );
}

/**
 * Owns category filtering and the lightbox's open/index state.
 *
 * Filtering is client-side over the full `photos` list rather than a
 * `category` search param + server refetch — see CategoryFilter's comment.
 * Switching category while the lightbox is open just closes it rather than
 * trying to remap the open index onto a different filtered list.
 *
 * `JustifiedGrid` stays a controlled, click-reporting grid. DialogContent's
 * shadcn defaults (small centered rounded card) are overridden at the call
 * site rather than hand-edited — components/ui/ is vendored — to the
 * full-bleed, radius-0 treatment DESIGN.md §6 calls for on photographs.
 * Sizing is done by pinning all four `inset` sides rather than `w-screen
 * h-dvh`: an element with opposing inset offsets set on every side and no
 * explicit width/height simply stretches to fill them, which sidesteps any
 * mismatch between viewport units and the actual visual viewport on mobile
 * browsers (the class of bug behind "the lightbox doesn't seem to open" —
 * it can open but render off-screen or zero-sized if `100dvh` is computed
 * against a stale viewport at the moment of opening).
 *
 * All of `filtered`'s photos mount as stacked LightboxPhotoLayers once the
 * dialog first opens (see the comment there for why) — combined with
 * LightboxPreloadLinks warming the network cache from page load, prev/next
 * inside an open lightbox should read as instant in practice.
 */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [category, setCategory] = useState<Category | undefined>();
  const filtered = useMemo(
    () => (category ? photos.filter((photo) => photo.category === category) : photos),
    [photos, category],
  );

  const [index, setIndex] = useState<number | null>(null);
  const active = index !== null ? filtered[index] : null;

  const handleCategoryChange = (next?: Category) => {
    setCategory(next);
    setIndex(null);
  };

  const goPrev = useCallback(() => setIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const goNext = useCallback(
    () => setIndex((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i)),
    [filtered.length],
  );

  const touchStartX = useRef<number | null>(null);

  return (
    <>
      <LightboxPreloadLinks photos={photos} />
      <CategoryFilter active={category} onSelect={handleCategoryChange} />
      <JustifiedGrid photos={filtered} onPhotoClick={setIndex} />

      <Dialog open={index !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <DialogContent
          showCloseButton={false}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") goPrev();
            else if (event.key === "ArrowRight") goNext();
          }}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStartX.current;
            if (delta > SWIPE_THRESHOLD_PX) goPrev();
            else if (delta < -SWIPE_THRESHOLD_PX) goNext();
            touchStartX.current = null;
          }}
          className="top-0 right-0 bottom-0 left-0 flex w-auto max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center gap-4 rounded-none border-0 bg-app-bg p-4 ring-0 sm:max-w-none sm:p-6"
        >
          {active ? (
            <>
              <DialogTitle className="sr-only">{active.caption ?? "Photo"}</DialogTitle>

              <DialogClose
                render={
                  <button
                    type="button"
                    aria-label="Close"
                    className="ring-focus-ring rounded-control touch-manipulation absolute top-2 right-2 z-10 cursor-pointer p-3 text-text-primary outline-none transition-opacity hover:text-text-accent focus-visible:ring-2"
                  />
                }
              >
                <Icon icon={X} size={24} />
              </DialogClose>

              <div className="relative w-full flex-1 overflow-hidden">
                {filtered.map((photo, i) => (
                  <LightboxPhotoLayer key={photo._id} photo={photo} active={i === index} />
                ))}
              </div>

              {active.caption || formatCapture(active.capture) ? (
                <div className="flex w-full max-w-3xl flex-col items-center gap-1 text-center">
                  {active.caption ? <p className="font-body text-text-primary">{active.caption}</p> : null}
                  {formatCapture(active.capture) ? (
                    <p className="font-mono text-xs tracking-widest text-text-accent uppercase">
                      {formatCapture(active.capture)}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-1 sm:px-4">
                <button
                  type="button"
                  aria-label="Previous photo"
                  disabled={index === 0}
                  onClick={goPrev}
                  className="ring-focus-ring rounded-control touch-manipulation cursor-pointer p-3 text-text-primary outline-none transition-opacity hover:text-text-accent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-0"
                >
                  <Icon icon={ChevronLeft} size={28} />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  disabled={index === filtered.length - 1}
                  onClick={goNext}
                  className="ring-focus-ring rounded-control touch-manipulation cursor-pointer p-3 text-text-primary outline-none transition-opacity hover:text-text-accent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-0"
                >
                  <Icon icon={ChevronRight} size={28} />
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
