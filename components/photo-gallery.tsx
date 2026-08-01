"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { Photo } from "@/lib/sanity/types";
import { Icon } from "./icon";
import { JustifiedGrid } from "./justified-grid";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

/** DESIGN.md §5: "NIKON Z8 · 85MM · ƒ1.4 · 1/200" — mono, only the fields actually present. */
function formatCapture(capture: Photo["capture"]) {
  if (!capture) return null;
  const parts = [capture.camera, capture.lens, capture.aperture, capture.shutter].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Owns the lightbox's open/index state; `JustifiedGrid` stays a controlled,
 * click-reporting grid. DialogContent's shadcn defaults (small centered
 * rounded card) are overridden at the call site rather than hand-edited —
 * components/ui/ is vendored — to the full-bleed, radius-0 treatment
 * DESIGN.md §6 calls for on photographs.
 */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const active = index !== null ? photos[index] : null;

  return (
    <>
      <JustifiedGrid photos={photos} onPhotoClick={setIndex} />

      <Dialog open={index !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <DialogContent
          showCloseButton
          className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col items-center justify-center gap-4 rounded-none border-0 bg-app-bg p-6 ring-0 sm:max-w-none"
        >
          {active ? (
            <>
              <DialogTitle className="sr-only">{active.caption ?? "Photo"}</DialogTitle>

              <div className="relative w-full flex-1 overflow-hidden">
                <Image
                  key={active._id}
                  src={urlFor(active.image).width(1800).quality(85).url()}
                  alt={active.image.alt ?? ""}
                  fill
                  sizes="100vw"
                  placeholder="blur"
                  blurDataURL={active.image.asset.metadata.lqip}
                  className="object-contain"
                  priority
                />
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

              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2 sm:px-6">
                <button
                  type="button"
                  aria-label="Previous photo"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => (i !== null ? i - 1 : i))}
                  className="ring-focus-ring rounded-control text-text-primary outline-none transition-opacity hover:text-text-accent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-0"
                >
                  <Icon icon={ChevronLeft} size={28} />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  disabled={index === photos.length - 1}
                  onClick={() => setIndex((i) => (i !== null ? i + 1 : i))}
                  className="ring-focus-ring rounded-control text-text-primary outline-none transition-opacity hover:text-text-accent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-0"
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
