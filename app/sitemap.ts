import type { MetadataRoute } from "next";
import { getFilms } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/about", changeFrequency: "yearly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/portfolio/photos", changeFrequency: "weekly", priority: 0.8 },
  { path: "/portfolio/videos", changeFrequency: "weekly", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const films = await getFilms();

  return [
    ...STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency,
      priority,
    })),
    ...films.map((film) => ({
      url: `${SITE_URL}/portfolio/videos/${film.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
