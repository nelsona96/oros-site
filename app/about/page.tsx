import type { Metadata } from "next";
import { AboutContent } from "@/components/about-content";
import { getSiteSettings } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata({
    title: "About",
    description: settings?.aboutBody ?? "The studio behind Oros Productions.",
    path: "/about",
  });
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return <AboutContent settings={settings} />;
}
