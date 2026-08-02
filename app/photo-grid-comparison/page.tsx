import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { Display, Eyebrow } from "@/components/typography";
import { getPhotos } from "@/lib/sanity/queries";
import { JustifiedNoCrop } from "./justified-no-crop";
import { MasonryGrid } from "./masonry-grid";

/**
 * Phase 12d decision gate (docs/BUILD_PLAN.md) — compares the photo grid
 * before it's fixed. Delete this whole directory once the call is made and
 * the winner is implemented in the real grid.
 */
export default async function PhotoGridComparisonPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const photos = await getPhotos();

  return (
    <div className="bg-app-bg text-text-primary min-h-screen">
      <Container className="space-y-16 py-16">
        <header>
          <Eyebrow>Dev only — Phase 12d decision gate</Eyebrow>
          <Display size="lg">Photo grid comparison</Display>
        </header>

        <section className="space-y-4">
          <Eyebrow tone="secondary">
            Candidate A — justified rows, aspect-ratio locked (no crop)
          </Eyebrow>
          <JustifiedNoCrop photos={photos} />
        </section>

        <section className="space-y-4">
          <Eyebrow tone="secondary">Candidate B — true masonry (CSS columns)</Eyebrow>
          <MasonryGrid photos={photos} />
        </section>
      </Container>
    </div>
  );
}
