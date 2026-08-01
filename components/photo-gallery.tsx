"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { Category, Photo } from "@/lib/sanity/types";
import { CategoryFilter } from "./category-filter";
import { Icon } from "./icon";
import { JustifiedGrid } from "./justified-grid";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog";

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
 * Its own component, rendered with `key={photo._id}` by the caller, so
 * switching photos remounts it fresh with `loading` back to `true` — no
 * effect needed to "reset state when a prop changes" (the React-docs
 * anti-pattern this sidesteps: resetting via an effect causes an extra
 * render and is exactly what a `key` change is for).
 */
function LightboxImage({ photo }: { photo: Photo }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full flex-1 overflow-hidden">
      {loading ? <Spinner /> : null}
      <Image
        src={urlFor(photo.image).width(1800).quality(85).url()}
        alt={photo.image.alt ?? ""}
        fill
        sizes="100vw"
        onLoad={() => setLoading(false)}
        className={`object-contain transition-opacity duration-200 ${loading ? "opacity-0" : "opacity-100"}`}
        priority
      />
    </div>
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
 * Switching between photos shows a spinner (LightboxImage, below) instead
 * of next/image's usual blur-up placeholder — the LQIP blur-then-sharpen
 * swap reads fine for a first paint, but felt like a flicker when it
 * replayed on every single prev/next inside an already-open lightbox.
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

              <LightboxImage key={active._id} photo={active} />

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
