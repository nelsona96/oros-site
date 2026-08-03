import type { Metadata } from "next";
import { AboutSummary } from "@/components/about-summary";
import { ContactCta } from "@/components/contact-cta";
import { Hero } from "@/components/hero";
import { Ridgeline } from "@/components/ridgeline";
import { SelectedWork } from "@/components/selected-work";
import { Services } from "@/components/services";
import { Testimonials } from "@/components/testimonials";
import {
  getFeaturedFilms,
  getFeaturedPhotos,
  getServices,
  getSiteSettings,
  getTestimonials,
} from "@/lib/sanity/queries";
import { DEFAULT_DESCRIPTION, pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata({
    description: settings?.tagline ?? DEFAULT_DESCRIPTION,
    path: "/",
  });
}

export default async function Home() {
  const [settings, photos, films, services, testimonials] = await Promise.all([
    getSiteSettings(),
    getFeaturedPhotos(),
    getFeaturedFilms(),
    getServices(),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      <SelectedWork photos={photos} films={films} />
      <Ridgeline position={70} />
      <Services services={services} />
      <Ridgeline position={20} />
      <AboutSummary settings={settings} />
      <Ridgeline position={55} />
      <Testimonials testimonials={testimonials} />
      <Ridgeline position={85} />
      <ContactCta settings={settings} />
    </>
  );
}
