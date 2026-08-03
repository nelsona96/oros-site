"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { Category, Photo } from "@/lib/sanity/types";
import { CategoryFilter } from "./category-filter";
import { Icon } from "./icon";
import { JustifiedGrid } from "./justified-grid";
import { Spinner } from "./spinner";
import { Body, Eyebrow } from "./typography";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog";

const LIGHTBOX_IMAGE_WIDTH = 1800;
const LIGHTBOX_IMAGE_QUALITY = 85;
const PHOTO_PARAM = "photo";

function lightboxImageUrl(photo: Photo) {
  return urlFor(photo.image)
    .width(LIGHTBOX_IMAGE_WIDTH)
    .quality(LIGHTBOX_IMAGE_QUALITY)
    .url();
}

/** DESIGN.md §5: "NIKON Z8 · 85MM · ƒ1.4 · 1/200" — mono, only the fields actually present. */
function formatCapture(capture: Photo["capture"]) {
  if (!capture) return null;
  const parts = [
    capture.camera,
    capture.lens,
    capture.aperture,
    capture.shutter,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

const SWIPE_THRESHOLD_PX = 50;

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
function LightboxPhotoLayer({
  photo,
  active,
}: {
  photo: Photo;
  active: boolean;
}) {
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
      {active && !loaded ? <Spinner label="Loading photo…" /> : null}
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

/** SPEC.md §4: a filtered view with nothing published yet gets a real message, not blank space. */
function EmptyPhotos() {
  return (
    <Body className="py-16 text-center">
      No photos here yet. Try a different category, or check back soon.
    </Body>
  );
}

/** Non-interactive stand-in for the Suspense fallback below — see PhotoGallery's comment. */
function PhotoGalleryFallback({ photos }: { photos: Photo[] }) {
  return (
    <>
      <CategoryFilter active={undefined} onSelect={() => {}} />
      {photos.length > 0 ? (
        <JustifiedGrid
          items={photos.map((photo) => ({ id: photo._id, image: photo.image, alt: photo.image.alt ?? "" }))}
        />
      ) : (
        <EmptyPhotos />
      )}
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
 *
 * Lightbox open state syncs with a shallow `?photo=<id>` URL param (Phase
 * 12e) via `window.history` directly — `useSearchParams()` only reads the
 * *initial* value once (deep-link support); every update after that uses
 * `pushState`/`replaceState`/`back()` plus a `popstate` listener, never a
 * reactive re-read, so there's no risk of an update loop between the two.
 * Opening pushes a new entry (so the browser back button closes it);
 * prev/next replace the current entry (so back always takes you out of
 * the lightbox in one press, not photo by photo); closing calls
 * `history.back()` when we're the ones who pushed the open entry, or
 * strips the param with `replaceState` when there's nothing of ours to
 * pop (a direct deep-link visit, where "back" should leave the site, not
 * be hijacked by the gallery). `history.pushState`/`replaceState` are the
 * Next-documented mechanism for shallow client-side URL updates — see
 * "Shallow routing on the client" in the App Router SPA guide.
 */
function PhotoGalleryInner({ photos }: { photos: Photo[] }) {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<Category | undefined>();
  const filtered = useMemo(
    () =>
      category ? photos.filter((photo) => photo.category === category) : photos,
    [photos, category],
  );

  const [index, setIndex] = useState<number | null>(() => {
    const photoId = searchParams.get(PHOTO_PARAM);
    if (!photoId) return null;
    const i = photos.findIndex((photo) => photo._id === photoId);
    return i >= 0 ? i : null;
  });
  const active = index !== null ? filtered[index] : null;

  const urlForPhoto = useCallback((photoId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(PHOTO_PARAM, photoId);
    return url;
  }, []);

  const openPhoto = useCallback(
    (i: number) => {
      const photoId = filtered[i]?._id;
      setIndex(i);
      if (photoId) window.history.pushState({ photoLightbox: true }, "", urlForPhoto(photoId));
    },
    [filtered, urlForPhoto],
  );

  const navigateToPhoto = useCallback(
    (i: number) => {
      const photoId = filtered[i]?._id;
      setIndex(i);
      if (photoId) window.history.replaceState({ photoLightbox: true }, "", urlForPhoto(photoId));
    },
    [filtered, urlForPhoto],
  );

  const closePhoto = useCallback(() => {
    setIndex(null);
    if ((window.history.state as { photoLightbox?: boolean } | null)?.photoLightbox) {
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete(PHOTO_PARAM);
      window.history.replaceState(null, "", url);
    }
  }, []);

  // The browser back/forward buttons change the URL without going through
  // any of the callbacks above — pushState/replaceState calls don't fire
  // popstate, only real history navigation does, so this listener can't
  // loop with them.
  useEffect(() => {
    const onPopState = () => {
      const photoId = new URLSearchParams(window.location.search).get(PHOTO_PARAM);
      if (!photoId) {
        setIndex(null);
        return;
      }
      const i = filtered.findIndex((photo) => photo._id === photoId);
      setIndex(i >= 0 ? i : null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [filtered]);

  const handleCategoryChange = (next?: Category) => {
    setCategory(next);
    closePhoto();
  };

  const goPrev = useCallback(() => {
    if (index !== null && index > 0) navigateToPhoto(index - 1);
  }, [index, navigateToPhoto]);
  const goNext = useCallback(() => {
    if (index !== null && index < filtered.length - 1) navigateToPhoto(index + 1);
  }, [index, filtered.length, navigateToPhoto]);

  const touchStartX = useRef<number | null>(null);

  return (
    <>
      <CategoryFilter active={category} onSelect={handleCategoryChange} />
      {filtered.length > 0 ? (
        <JustifiedGrid
          items={filtered.map((photo) => ({ id: photo._id, image: photo.image, alt: photo.image.alt ?? "" }))}
          onItemClick={openPhoto}
        />
      ) : (
        <EmptyPhotos />
      )}

      <Dialog open={index !== null} onOpenChange={(open) => !open && closePhoto()}>
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
          className="bg-app-bg top-0 right-0 bottom-0 left-0 flex w-auto max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center gap-4 rounded-none border-0 p-4 ring-0 sm:max-w-none sm:p-6"
        >
          {active ? (
            <>
              <DialogTitle className="sr-only">
                {active.caption ?? "Photo"}
              </DialogTitle>

              <DialogClose
                render={
                  <button
                    type="button"
                    aria-label="Close"
                    className="rounded-control text-text-primary hover:text-text-accent absolute top-2 right-2 z-10 cursor-pointer touch-manipulation p-3 transition-opacity"
                  />
                }
              >
                <Icon icon={X} size={24} />
              </DialogClose>

              <div className="relative w-full flex-1 overflow-hidden">
                {filtered.map((photo, i) => (
                  <LightboxPhotoLayer
                    key={photo._id}
                    photo={photo}
                    active={i === index}
                  />
                ))}
              </div>

              {active.caption || formatCapture(active.capture) ? (
                <div className="flex w-full max-w-3xl flex-col items-center gap-1 text-center">
                  {active.caption ? <Body tone="primary">{active.caption}</Body> : null}
                  {formatCapture(active.capture) ? (
                    <Eyebrow>{formatCapture(active.capture)}</Eyebrow>
                  ) : null}
                </div>
              ) : null}

              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-1 sm:px-4">
                <button
                  type="button"
                  aria-label="Previous photo"
                  disabled={index === 0}
                  onClick={goPrev}
                  className="rounded-control text-text-primary hover:text-text-accent cursor-pointer touch-manipulation p-3 transition-opacity disabled:pointer-events-none disabled:opacity-0"
                >
                  <Icon icon={ChevronLeft} size={28} />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  disabled={index === filtered.length - 1}
                  onClick={goNext}
                  className="rounded-control text-text-primary hover:text-text-accent cursor-pointer touch-manipulation p-3 transition-opacity disabled:pointer-events-none disabled:opacity-0"
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

/**
 * `PhotoGalleryInner` calls `useSearchParams()` for the initial deep-link
 * lookup, which Next requires be wrapped in Suspense on a statically
 * rendered route (see the App Router `useSearchParams` reference) — without
 * it, `next build` fails outright rather than just warning. The fallback
 * mirrors the common case (no `?photo=` in the URL) almost exactly —
 * category filter and grid, nothing clickable yet — so hydration replacing
 * it is imperceptible for every visit except an actual deep link, where
 * seeing the grid for a moment before the linked photo opens is the
 * correct, expected progressive-enhancement behavior, not a bug.
 * `LightboxPreloadLinks` needs no search params, so it renders outside the
 * boundary and starts warming the cache immediately regardless of hydration
 * timing.
 */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  return (
    <>
      <LightboxPreloadLinks photos={photos} />
      <Suspense fallback={<PhotoGalleryFallback photos={photos} />}>
        <PhotoGalleryInner photos={photos} />
      </Suspense>
    </>
  );
}
