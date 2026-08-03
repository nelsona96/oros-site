import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Body, Display, Eyebrow } from "@/components/typography";
import { VideoCard } from "@/components/video-card";
import { getFilms } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Videos",
  description: "Films across weddings, commercial work, portraiture, and ministry.",
  path: "/portfolio/videos",
});

export default async function VideosPage() {
  const films = await getFilms();

  return (
    <Section className="pt-8 md:pt-12">
      <Container className="space-y-8">
        <div className="space-y-4">
          <Eyebrow>Portfolio</Eyebrow>
          <Display as="h1" size="md">
            Videos.
          </Display>
        </div>
        {films.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {films.map((film) => (
              <VideoCard key={film._id} film={film} />
            ))}
          </div>
        ) : (
          <Body className="py-16 text-center">No films published yet.</Body>
        )}
      </Container>
    </Section>
  );
}
