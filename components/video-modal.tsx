import { categoryLabel, formatDuration } from "@/lib/film";
import type { Film } from "@/lib/sanity/types";
import { FilmPlayer } from "./film-player";
import { Display } from "./typography";
import { VideoModalShell } from "./video-modal-shell";

export function VideoModal({ film }: { film: Film }) {
  const duration = film.duration ? formatDuration(film.duration) : null;

  return (
    <VideoModalShell title={film.title}>
      <div className="rounded-control bg-surface relative aspect-video overflow-hidden">
        <FilmPlayer film={film} />
      </div>

      <div className="space-y-1">
        <Display as="h2" className="text-text-primary text-2xl md:text-3xl">
          {film.title}
        </Display>
        <p className="text-text-accent font-mono text-xs tracking-widest uppercase">
          {categoryLabel(film.category)}
          {duration ? ` · ${duration}` : ""}
        </p>
        {film.description ? (
          <p className="font-body text-text-secondary">{film.description}</p>
        ) : null}
      </div>
    </VideoModalShell>
  );
}
