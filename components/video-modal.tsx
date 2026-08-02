import { categoryLabel, formatDuration } from "@/lib/film";
import type { Film } from "@/lib/sanity/types";
import { FilmPlayer } from "./film-player";
import { Body, Display, Eyebrow } from "./typography";
import { VideoModalShell } from "./video-modal-shell";

export function VideoModal({ film }: { film: Film }) {
  const duration = film.duration ? formatDuration(film.duration) : null;

  return (
    <VideoModalShell title={film.title}>
      <div className="rounded-control bg-surface relative aspect-video overflow-hidden">
        <FilmPlayer film={film} />
      </div>

      <div className="space-y-1">
        <Display as="h2" size="sm" className="text-text-primary">
          {film.title}
        </Display>
        <Eyebrow>
          {categoryLabel(film.category)}
          {duration ? ` · ${duration}` : ""}
        </Eyebrow>
        {film.description ? <Body>{film.description}</Body> : null}
      </div>
    </VideoModalShell>
  );
}
