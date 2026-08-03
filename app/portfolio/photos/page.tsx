import type { Metadata } from "next";
import { Container } from "@/components/container";
import { PhotoGallery } from "@/components/photo-gallery";
import { Section } from "@/components/section";
import { Display, Eyebrow } from "@/components/typography";
import { getPhotos } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Photos",
  description:
    "A portfolio of photography across weddings, commercial work, portraiture, and ministry.",
  path: "/portfolio/photos",
});

export default async function PhotosPage() {
  const photos = await getPhotos();

  return (
    <Section className="pt-8 md:pt-12">
      <Container className="space-y-8">
        <div className="space-y-4">
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
