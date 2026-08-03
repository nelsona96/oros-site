import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import type { Film, Photo } from "@/lib/sanity/types";
import { Container } from "./container";
import { Icon } from "./icon";
import { JustifiedGrid, type JustifiedGridItem } from "./justified-grid";
import { Section } from "./section";
import { Display, Eyebrow } from "./typography";

type FilmWithThumbnail = Film & { thumbnail: NonNullable<Film["thumbnail"]> };

/**
 * DESIGN.md §8.2: "a cross-vertical cut, leading into the portfolio."
 * Shares `JustifiedGrid` with the real portfolio grid (Phase 12d) rather
 * than its own CSS-columns layout. Each featured photo's item carries its
 * own `href` (Phase 12f) — `/portfolio/photos?photo=<id>`, deep-linking
 * into the portfolio's own lightbox via Phase 12e's URL state — so it
 * renders as a real `<a>`, not a `<button onClick>`: this is navigation to
 * a different page, not an in-page action. Films stay non-interactive;
 * only photos were asked to deep-link here.
 *
 * Films without a hand-picked thumbnail are skipped rather than falling back
 * to a Mux poster here — pulling that in is Phase 9's job, not this one's.
 */
export function SelectedWork({ photos, films }: { photos: Photo[]; films: Film[] }) {
  const filmsWithThumbnail = films.filter((film): film is FilmWithThumbnail => Boolean(film.thumbnail));

  if (photos.length === 0 && filmsWithThumbnail.length === 0) return null;

  const photoItems: JustifiedGridItem[] = photos.map((photo) => ({
    id: photo._id,
    image: photo.image,
    alt: photo.image.alt ?? "",
    href: `/portfolio/photos?photo=${photo._id}`,
  }));

  const filmItems: JustifiedGridItem[] = filmsWithThumbnail.map((film) => ({
    id: film._id,
    image: film.thumbnail,
    alt: film.thumbnail.alt ?? film.title,
    overlay: (
      <div className="scrim absolute inset-0 flex items-end p-3">
        <Eyebrow as="span" tone="primary" className="flex items-center gap-1.5">
          <Icon icon={Play} size={14} />
          Film
        </Eyebrow>
      </div>
    ),
  }));

  return (
    <Section>
      <Container className="space-y-8">
        <div className="space-y-4">
          <Eyebrow>Selected Work</Eyebrow>
          <Display as="h2" size="md">
            Recent work, worth a closer look.
          </Display>
        </div>

        <JustifiedGrid items={[...photoItems, ...filmItems]} />

        <div className="flex justify-center">
          <Link
            href="/portfolio/photos"
            className="rounded-control flex items-center gap-1 font-mono text-xs tracking-widest text-text-primary uppercase transition-colors hover:text-text-accent"
          >
            View the full portfolio
            <Icon icon={ChevronRight} size={16} />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
