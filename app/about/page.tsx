import { AboutContent } from "@/components/about-content";
import { getSiteSettings } from "@/lib/sanity/queries";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return <AboutContent settings={settings} />;
}
