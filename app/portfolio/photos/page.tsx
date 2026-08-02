import { Container } from "@/components/container";
import { PhotoGallery } from "@/components/photo-gallery";
import { Section } from "@/components/section";
import { Display, Eyebrow } from "@/components/typography";
import { getPhotos } from "@/lib/sanity/queries";

export default async function PhotosPage() {
  const photos = await getPhotos();

  return (
    <Section className="pt-8 md:pt-12">
      <Container className="space-y-8">
        <div>
          <Eyebrow>Portfolio</Eyebrow>
          <Display as="h1" size="md">
            Photos.
          </Display>
        </div>
        <PhotoGallery photos={photos} />
      </Container>
    </Section>
  );
}
