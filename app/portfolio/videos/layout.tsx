import type { ReactNode } from "react";

/**
 * Owns the `@modal` parallel-route slot for the intercepting-route player
 * overlay (see `@modal/(.)[slug]/page.tsx`) — scoped to `videos/` rather
 * than the shared `app/portfolio/layout.tsx`, which only owns the
 * Photos/Videos tab bar and has no reason to know about the modal.
 */
export default function VideosLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
