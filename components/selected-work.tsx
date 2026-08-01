import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { Film, Photo } from "@/lib/sanity/types";
import { Container } from "./container";
import { Icon } from "./icon";
import { Section } from "./section";
import { Display, Eyebrow } from "./typography";

const COLUMN_SIZES = "(min-width: 768px) 25vw, 50vw";

type FilmWithThumbnail = Film & { thumbnail: NonNullable<Film["thumbnail"]> };

/**
 * DESIGN.md §8.2: "a cross-vertical cut, leading into the portfolio." Photos
 * and films are laid out in CSS columns (a masonry flow) rather than the
 * flex-grow justified grid Phase 8 builds for the real portfolio — that grid
 * balances whole rows, which is more machinery than a curated highlights
 * strip needs, and columns preserve each image's real aspect ratio (§7:
 * cropping to a uniform grid is rejected) with zero JS.
 *
 * Films without a hand-picked thumbnail are skipped rather than falling back
 * to a Mux poster here — pulling that in is Phase 9's job, not this one's.
 */
export function SelectedWork({ photos, films }: { photos: Photo[]; films: Film[] }) {
  const filmsWithThumbnail = films.filter((film): film is FilmWithThumbnail => Boolean(film.thumbnail));

  if (photos.length === 0 && filmsWithThumbnail.length === 0) return null;

  return (
    <Section>
      <Container className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Selected Work</Eyebrow>
            <Display as="h2" className="text-4xl md:text-5xl">
              A cross-vertical cut of recent work.
            </Display>
          </div>
          <Link
            href="/portfolio/photos"
            className="ring-focus-ring rounded-control flex items-center gap-1 font-mono text-xs tracking-widest text-text-primary uppercase outline-none transition-colors hover:text-text-accent focus-visible:ring-2"
          >
            View the full portfolio
            <Icon icon={ChevronRight} size={16} />
          </Link>
        </div>

        <div className="columns-2 gap-4 md:columns-4">
          {photos.map((photo) => (
            <div key={photo._id} className="mb-4 break-inside-avoid">
              <Image
                src={urlFor(photo.image).width(800).quality(80).url()}
                alt={photo.image.alt ?? ""}
                width={photo.image.asset.metadata.dimensions.width}
                height={photo.image.asset.metadata.dimensions.height}
                sizes={COLUMN_SIZES}
                placeholder="blur"
                blurDataURL={photo.image.asset.metadata.lqip}
                className="border-border h-auto w-full border"
              />
            </div>
          ))}
          {filmsWithThumbnail.map((film) => (
            <div key={film._id} className="relative mb-4 break-inside-avoid">
              <Image
                src={urlFor(film.thumbnail).width(800).quality(80).url()}
                alt={film.thumbnail.alt ?? film.title}
                width={film.thumbnail.asset.metadata.dimensions.width}
                height={film.thumbnail.asset.metadata.dimensions.height}
                sizes={COLUMN_SIZES}
                placeholder="blur"
                blurDataURL={film.thumbnail.asset.metadata.lqip}
                className="border-border h-auto w-full border"
              />
              <div className="scrim absolute inset-0 flex items-end p-3">
                <span className="flex items-center gap-1.5 font-mono text-xs tracking-widest text-text-primary uppercase">
                  <Icon icon={Play} size={14} />
                  Film
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
