"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { Icon } from "./icon";
import { Dialog, DialogClose, DialogPortal, DialogTitle } from "./ui/dialog";

/**
 * The Dialog chrome shared by `VideoModal` (real content) and
 * `VideoModalLoading` (the `loading.tsx` fallback shown while the film data
 * is still fetching) — factored out so both stay visually identical.
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
 * this one ("grid still behind it") — so this is a large centered card
 * instead of a full-viewport takeover, and the backdrop stays semi-transparent
 * rather than darkened: darkening it to fully hide the grid would just be the
 * photo lightbox's treatment again, defeating the one thing DESIGN.md calls
 * out as different here.
 *
 * `DialogPrimitive.Backdrop`/`.Popup` are composed directly here rather than
 * through `components/ui/dialog.tsx`'s `DialogContent` (which is what
 * `photo-gallery.tsx` uses) — not a vendored-file edit, just building from the
 * same primitives at one level lower. `DialogContent` hardcodes
 * `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95` (a fade +
 * scale-up entrance), and tailwind-merge doesn't recognize those tw-animate-css
 * utility names as conflicting with anything, so there's no clean className
 * override to cancel them — the same gap that made the `rounded-xl` default
 * need a `rounded-lg` pairing to actually cancel (see git history). For the
 * photo lightbox that animation is harmless (one Dialog instance for the
 * whole time it's open). For this modal it's actively wrong: the loading
 * skeleton (`VideoModalLoading`) and the real content (`VideoModal`) are
 * *separate* Suspense-boundary subtrees per Next's `loading.tsx` convention —
 * React unmounts one and mounts the other when the film data resolves, so
 * reusing `DialogContent` meant the entrance animation replayed a second time
 * on that swap, reading as the modal quietly popping/flickering rather than
 * the content just quietly updating in place. Composing the primitives
 * directly, with no entrance/exit animation classes at all, means both the
 * initial open *and* the loading→loaded swap just appear — nothing to notice
 * either way.
 */
export function VideoModalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogPortal>
        <DialogPrimitive.Backdrop
          data-slot="dialog-overlay"
          className="fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs"
        />
        <DialogPrimitive.Popup
          initialFocus={closeButtonRef}
          data-slot="dialog-content"
          className="rounded-control bg-app-bg fixed top-1/2 left-1/2 z-50 grid w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 gap-4 p-4 outline-none sm:p-6"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>

          <DialogClose
            render={
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close"
                className="rounded-control text-text-primary hover:text-text-accent absolute top-4 right-4 z-10 cursor-pointer touch-manipulation p-3 transition-opacity sm:top-6 sm:right-6"
              />
            }
          >
            <Icon icon={X} size={24} />
          </DialogClose>

          {children}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
