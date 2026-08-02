import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Display, Eyebrow } from "@/components/typography";
import { VideoCard } from "@/components/video-card";
import { getFilms } from "@/lib/sanity/queries";

export default async function VideosPage() {
  const films = await getFilms();

  return (
    <Section className="pt-8 md:pt-12">
      <Container className="space-y-8">
        <div>
          <Eyebrow>Portfolio</Eyebrow>
          <Display as="h1" className="text-4xl md:text-5xl">
            Videos.
          </Display>
        </div>
        {films.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {films.map((film) => (
              <VideoCard key={film._id} film={film} />
            ))}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
