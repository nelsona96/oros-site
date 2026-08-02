"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "./icon";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog";

/**
 * The Dialog chrome shared by `VideoModal` (real content) and
 * `VideoModalLoading` (the `loading.tsx` fallback shown while the film data
 * is still fetching) — factored out so both stay visually identical and the
 * tailwind-merge fix below only has to live in one place.
 *
 * The intercepting route (`app/portfolio/videos/@modal/(.)[slug]/page.tsx`,
 * and its sibling `loading.tsx`) only renders this while the modal should be
 * open — there's no local open/closed state to track. `open` stays `true`
 * for the component's whole lifetime; closing (Escape, backdrop click, or
 * the close button, all funneled through `onOpenChange`) calls
 * `router.back()`, which is Next's own documented pattern for a modal built
 * on intercepting + parallel routes — popping the URL back to
 * `/portfolio/videos` is what actually unmounts this component.
 *
 * Unlike the photo lightbox (`components/photo-gallery.tsx`), which goes
 * full-bleed and opaque, DESIGN.md §9 wants the grid to stay visible behind
 * this one ("grid still behind it") — so `DialogContent` is overridden to a
 * large centered card instead of a full-viewport takeover, and the
 * *default* semi-transparent backdrop is left alone rather than darkened:
 * darkening it to fully hide the grid would just be the photo lightbox's
 * treatment again, defeating the one thing DESIGN.md calls out as
 * different here.
 */
export function VideoModalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogContent
        showCloseButton={false}
        // `rounded-control` alone doesn't cancel the default `rounded-xl`: tailwind-merge
        // only recognizes standard Tailwind size names as conflicting within a class
        // group, and doesn't know about this project's custom `--radius-control` theme
        // key, so both would apply and fight over which one wins in the compiled
        // stylesheet's cascade order. `rounded-lg` is this theme's real, tailwind-merge-
        // recognized alias for the exact same `var(--radius)` value (see globals.css),
        // so pairing it here guarantees `rounded-xl` is actually gone rather than
        // "probably close enough" — the leftover-default gotcha from photo-gallery.tsx's
        // own DialogContent override, just for a non-zero radius instead of `rounded-none`.
        className="rounded-control border-border bg-app-bg w-full max-w-4xl gap-4 rounded-lg p-4 ring-0 sm:max-w-4xl sm:p-6"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <DialogClose
          render={
            <button
              type="button"
              aria-label="Close"
              className="ring-focus-ring rounded-control text-text-primary hover:text-text-accent absolute top-2 right-2 z-10 cursor-pointer touch-manipulation p-3 transition-opacity outline-none focus-visible:ring-2"
            />
          }
        >
          <Icon icon={X} size={24} />
        </DialogClose>

        {children}
      </DialogContent>
    </Dialog>
  );
}
