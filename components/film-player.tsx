import MuxPlayer from "@mux/mux-player-react";
import type { MuxPlayerCSSProperties } from "@mux/mux-player-react";
import { urlFor } from "@/lib/sanity/image";
import type { Film } from "@/lib/sanity/types";

const POSTER_WIDTH = 1600;
const POSTER_QUALITY = 85;

/**
 * DESIGN.md §9's "amber controls" — mux-player themes its own controls from
 * these three CSS-var-backed props rather than hardcoded colors, so it
 * inherits Sand/Gold/Amber like everything else (CLAUDE.md's color-token
 * rule). `--light-solid` (amber-9) is the exact token DESIGN.md §4 names
 * for "Play control"; `--overlay` is named "Behind the video player
 * overlay"; `--surface` (this player's own containing box, set by the
 * caller) is named "the video player shell" — all three anticipate this
 * component specifically.
 *
 * `--media-focus-box-shadow` is a separate, fourth override: media-chrome
 * (the library mux-player's controls are built on) hardcodes every control's
 * keyboard-focus ring — the play button, the seek bar, etc. — to
 * `inset 0 0 0 2px rgb(27 127 204 / .9)`, a blue with no relationship to
 * `primaryColor`/`secondaryColor`/`accentColor` above. Left alone, tabbing to
 * the play button shows a plain browser-default-looking blue ring that
 * breaks the site's one accent color used everywhere else. Same shape,
 * amber color instead.
 *
 * No `poster` when there's no hand-picked Sanity thumbnail: mux-player
 * already falls back to its own auto-generated Mux poster in that case, so
 * there's nothing to wire up (mirrors VideoCard's identical fallback, just
 * for the player instead of the grid).
 */
export function FilmPlayer({ film }: { film: Film }) {
  return (
    <MuxPlayer
      playbackId={film.playbackId}
      poster={
        film.thumbnail
          ? urlFor(film.thumbnail)
              .width(POSTER_WIDTH)
              .quality(POSTER_QUALITY)
              .url()
          : undefined
      }
      primaryColor="var(--text-primary)"
      secondaryColor="var(--overlay)"
      accentColor="var(--light-solid)"
      style={
        {
          width: "100%",
          height: "100%",
          "--media-focus-box-shadow": "inset 0 0 0 2px var(--light-solid)",
        } satisfies MuxPlayerCSSProperties
      }
    />
  );
}
