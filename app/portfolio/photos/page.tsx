import { CategoryFilter } from "@/components/category-filter";
import { Container } from "@/components/container";
import { PhotoGallery } from "@/components/photo-gallery";
import { Section } from "@/components/section";
import { Display, Eyebrow } from "@/components/typography";
import { getPhotos } from "@/lib/sanity/queries";
import { CATEGORIES, type Category } from "@/lib/sanity/types";

function parseCategory(value: string | string[] | undefined): Category | undefined {
  return CATEGORIES.find((category) => category.value === value)?.value;
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const category = parseCategory((await searchParams).category);
  const photos = await getPhotos(category);

  return (
    <Section className="pt-8 md:pt-12">
      <Container className="space-y-8">
        <div>
          <Eyebrow>Portfolio</Eyebrow>
          <Display as="h1" className="text-4xl md:text-5xl">
            Photos.
          </Display>
        </div>
        <CategoryFilter active={category} />
        <PhotoGallery photos={photos} />
      </Container>
    </Section>
  );
}
