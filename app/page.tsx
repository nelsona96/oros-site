import { Hero } from "@/components/hero";
import { Ridgeline } from "@/components/ridgeline";
import { SelectedWork } from "@/components/selected-work";
import { Services } from "@/components/services";
import { getFeaturedFilms, getFeaturedPhotos, getServices, getSiteSettings } from "@/lib/sanity/queries";

export default async function Home() {
  const [settings, photos, films, services] = await Promise.all([
    getSiteSettings(),
    getFeaturedPhotos(),
    getFeaturedFilms(),
    getServices(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      <SelectedWork photos={photos} films={films} />
      <Ridgeline position={70} />
      <Services services={services} />
    </>
  );
}
