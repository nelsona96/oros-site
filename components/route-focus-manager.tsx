"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * DESIGN.md §11's accessibility floor implies route-change focus management:
 * the App Router doesn't reset focus on a client-side navigation the way a
 * full page load does, so after clicking a nav link, keyboard/screen-reader
 * users stay focused on that link with no signal a new page loaded — moving
 * focus to the main landmark is what gives them that signal, the same way a
 * full navigation resetting focus to the document would.
 *
 * Skipped whenever a dialog is open (`[role="dialog"]` in the DOM) — both
 * the photo lightbox and the intercepted video modal manage their own focus
 * on open (the modal via Base UI's `initialFocus`), and would otherwise get
 * fought over. Only the video modal is actually reachable here in practice:
 * it's the one dialog whose open state is a real route change (the photo
 * lightbox syncs via `window.history.pushState` directly, which doesn't go
 * through `next/navigation`'s router, so `usePathname()` never re-fires for
 * it) — but the guard is written generally rather than assuming that stays
 * true. Base UI sets its own focus in a layout effect, which the browser
 * guarantees runs before this component's (passive) effect on the same
 * commit, regardless of tree position, so the dialog is already present and
 * focused by the time this check runs.
 *
 * Skips the very first render — the browser already handles initial-load
 * focus correctly on its own; this is only for subsequent client-side
 * navigations.
 */
export function RouteFocusManager() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!document.querySelector('[role="dialog"]')) {
      document.getElementById("main-content")?.focus();
    }
  }, [pathname]);

  return null;
}
