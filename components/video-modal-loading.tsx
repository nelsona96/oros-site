import { Spinner } from "./spinner";
import { VideoModalShell } from "./video-modal-shell";

/**
 * The `loading.tsx` fallback for the intercepted route — Next suspends on
 * `getFilmBySlug` inside `@modal/(.)[slug]/page.tsx` and shows this
 * immediately on click, so the overlay appears right away instead of the
 * click just hanging until the fetch resolves. Same `VideoModalShell` as the
 * real `VideoModal`, so the dialog itself doesn't jump in size once the
 * actual film swaps in.
 */
export function VideoModalLoading() {
  return (
    <VideoModalShell title="Loading video…">
      <div className="rounded-control bg-surface relative aspect-video overflow-hidden">
        <Spinner label="Loading video…" />
      </div>
    </VideoModalShell>
  );
}
