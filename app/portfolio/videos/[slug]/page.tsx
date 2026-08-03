import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/container";
import { FilmPlayer } from "@/components/film-player";
import { Section } from "@/components/section";
import { Body, Display, Eyebrow } from "@/components/typography";
import { categoryLabel, formatDuration } from "@/lib/film";
import { getFilmBySlug } from "@/lib/sanity/queries";

/**
 * Deliberately no `loading.tsx` here (unlike the intercepted modal route's
 * `VideoModalLoading`) — a sibling `loading.tsx` turned this segment into a
 * Suspense boundary that, paired with the `@modal` parallel slot on
 * `app/portfolio/videos/layout.tsx`, never actually swapped from the fallback
 * to the resolved page client-side: it just hung on the spinner forever
 * (confirmed against both `next dev` and a clean `next build && next start`,
 * so not a dev-only artifact). Since this route is genuinely fast in
 * practice (one Sanity fetch, no artificial delay), a normal blocking
 * navigation reads fine without an explicit loading state.
 */
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
        {/* A direct-visit/shared-link landing has no modal-close or back button to return to the
            grid with — the top tab bar can do it, but a same-purpose breadcrumb one tap away is
            more discoverable than expecting a visitor to notice "Videos" is also a nav link.
            `inline-block`, not the default inline: a plain inline element's vertical margins
            (including the `space-y-6` above, pushing the next sibling down) have no layout
            effect per the CSS box model, so without it there's no visible gap above the video
            box despite the parent's spacing utility. `align-top` alongside it: an inline-block
            otherwise sits on its line box's baseline, which (with no other inline content in
            this block-level parent) reads as a several-pixel drop versus a plain block element
            like Eyebrow's <p> — align-top removes that phantom offset so this sits flush with
            every other page's first line of content. */}
        <Link
          href="/portfolio/videos"
          className="rounded-control text-text-accent hover:text-text-primary inline-block align-top font-mono text-xs tracking-widest uppercase transition-colors"
        >
          Portfolio / Videos
        </Link>
        <div className="rounded-control bg-surface relative aspect-video overflow-hidden">
          <FilmPlayer film={film} />
        </div>
        <div className="space-y-1">
          <Display as="h1" size="md">
            {film.title}
          </Display>
          <Eyebrow>
            {categoryLabel(film.category)}
            {duration ? ` · ${duration}` : ""}
          </Eyebrow>
          {film.description ? <Body className="max-w-prose">{film.description}</Body> : null}
        </div>
      </Container>
    </Section>
  );
}
