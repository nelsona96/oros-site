import { Hero } from "@/components/hero";
import { getSiteSettings } from "@/lib/sanity/queries";

export default async function Home() {
  const settings = await getSiteSettings();

  return <Hero settings={settings} />;
}
