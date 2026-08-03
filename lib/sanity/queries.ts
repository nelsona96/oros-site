import { client } from "./client";
import type { Category, Photo, Film, Testimonial, Service, SiteSettings } from "./types";

/**
 * Every query goes through this rather than calling `client.fetch` directly.
 * A Sanity outage should degrade the page section-by-section (each
 * component already self-guards on empty/missing data, per the established
 * pattern) rather than throwing the whole route into `error.tsx` — a
 * fallback here is indistinguishable from "nothing published yet" to the
 * component that receives it, which is exactly the degraded-but-still-
 * useful state we want. `error.tsx` stays as the backstop for errors that
 * aren't a data fetch (a render error, a bug), not the first line of
 * defense for a flaky upstream API.
 */
async function safeFetch<T>(
  query: string,
  params: Record<string, unknown>,
  tags: string[],
  fallback: T,
): Promise<T> {
  try {
    return await client.fetch<T>(query, params, { next: { tags } });
  } catch (error) {
    console.error(`Sanity fetch failed (tags: ${tags.join(", ")})`, error);
    return fallback;
  }
}

/**
 * Dimensions and an LQIP are always selected (docs/SPEC.md §3) so the
 * justified grid never shifts — urlFor() builds the actual src per usage.
 */
const IMAGE_PROJECTION = `{
  "asset": asset->{url, metadata{dimensions, lqip}},
  alt,
  hotspot
}`;

const PHOTO_PROJECTION = `{
  _id,
  "image": image${IMAGE_PROJECTION},
  category,
  caption,
  capture,
  featured,
  order
}`;

const FILM_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  category,
  "playbackId": video.asset->playbackId,
  "duration": video.asset->data.duration,
  "thumbnail": thumbnail${IMAGE_PROJECTION},
  "captionsUrl": captions.asset->url,
  description,
  client,
  date,
  featured,
  order
}`;

const TESTIMONIAL_PROJECTION = `{
  _id, quote, attribution, role,
  "image": image${IMAGE_PROJECTION},
  category, order
}`;

const SERVICE_PROJECTION = `{
  _id, title, "slug": slug.current, blurb, order,
  "coverImage": coverImage${IMAGE_PROJECTION}
}`;

const SITE_SETTINGS_PROJECTION = `{
  name,
  tagline,
  "heroVideoUrl": heroVideo.asset->url,
  "heroPoster": heroPoster${IMAGE_PROJECTION},
  aboutHeading,
  aboutBody,
  aboutLongForm,
  "portrait": portrait${IMAGE_PROJECTION},
  contactEmail,
  contactPhone,
  instagramHandle,
  "ogImage": ogImage${IMAGE_PROJECTION},
  metaDescription
}`;

export async function getPhotos(category?: Category): Promise<Photo[]> {
  const filter = category ? "&& category == $category" : "";
  return safeFetch<Photo[]>(
    `*[_type == "photo" ${filter}] | order(order asc)${PHOTO_PROJECTION}`,
    { category },
    ["photo"],
    [],
  );
}

export async function getFeaturedPhotos(): Promise<Photo[]> {
  return safeFetch<Photo[]>(
    `*[_type == "photo" && featured == true] | order(order asc)${PHOTO_PROJECTION}`,
    {},
    ["photo"],
    [],
  );
}

export async function getFilms(): Promise<Film[]> {
  return safeFetch<Film[]>(
    `*[_type == "film"] | order(order asc)${FILM_PROJECTION}`,
    {},
    ["film"],
    [],
  );
}

export async function getFeaturedFilms(): Promise<Film[]> {
  return safeFetch<Film[]>(
    `*[_type == "film" && featured == true] | order(order asc)${FILM_PROJECTION}`,
    {},
    ["film"],
    [],
  );
}

export async function getFilmBySlug(slug: string): Promise<Film | null> {
  return safeFetch<Film | null>(
    `*[_type == "film" && slug.current == $slug][0]${FILM_PROJECTION}`,
    { slug },
    ["film"],
    null,
  );
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return safeFetch<Testimonial[]>(
    `*[_type == "testimonial"] | order(order asc)${TESTIMONIAL_PROJECTION}`,
    {},
    ["testimonial"],
    [],
  );
}

export async function getServices(): Promise<Service[]> {
  return safeFetch<Service[]>(
    `*[_type == "service"] | order(order asc)${SERVICE_PROJECTION}`,
    {},
    ["service"],
    [],
  );
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return safeFetch<SiteSettings | null>(
    `*[_id == "siteSettings"][0]${SITE_SETTINGS_PROJECTION}`,
    {},
    ["siteSettings"],
    null,
  );
}
