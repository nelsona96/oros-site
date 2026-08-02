import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { FilmPlayer } from "@/components/film-player";
import { Section } from "@/components/section";
import { Display, Eyebrow } from "@/components/typography";
import { categoryLabel, formatDuration } from "@/lib/film";
import { getFilmBySlug } from "@/lib/sanity/queries";

export default async function FilmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = await getFilmBySlug(slug);
  if (!film) notFound();

  const duration = film.duration ? formatDuration(film.duration) : null;

  return (
    <Section className="pt-8 md:pt-12">
      <Container className="space-y-6">
        <Eyebrow>Portfolio / Videos</Eyebrow>
        <div className="rounded-control bg-surface relative aspect-video overflow-hidden">
          <FilmPlayer film={film} />
        </div>
        <div className="space-y-2">
          <Display as="h1" className="text-3xl md:text-4xl">
            {film.title}
          </Display>
          <p className="text-text-accent font-mono text-xs tracking-widest uppercase">
            {categoryLabel(film.category)}
            {duration ? ` · ${duration}` : ""}
          </p>
          {film.description ? (
            <p className="font-body text-text-secondary max-w-prose">
              {film.description}
            </p>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
