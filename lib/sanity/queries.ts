import { client } from "./client";
import type { Category, Photo, Film, Testimonial, Service, SiteSettings } from "./types";

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
  return client.fetch<Photo[]>(
    `*[_type == "photo" ${filter}] | order(order asc)${PHOTO_PROJECTION}`,
    { category },
    { next: { tags: ["photo"] } },
  );
}

export async function getFeaturedPhotos(): Promise<Photo[]> {
  return client.fetch<Photo[]>(
    `*[_type == "photo" && featured == true] | order(order asc)${PHOTO_PROJECTION}`,
    {},
    { next: { tags: ["photo"] } },
  );
}

export async function getFilms(): Promise<Film[]> {
  return client.fetch<Film[]>(
    `*[_type == "film"] | order(order asc)${FILM_PROJECTION}`,
    {},
    { next: { tags: ["film"] } },
  );
}

export async function getFeaturedFilms(): Promise<Film[]> {
  return client.fetch<Film[]>(
    `*[_type == "film" && featured == true] | order(order asc)${FILM_PROJECTION}`,
    {},
    { next: { tags: ["film"] } },
  );
}

export async function getFilmBySlug(slug: string): Promise<Film | null> {
  return client.fetch<Film | null>(
    `*[_type == "film" && slug.current == $slug][0]${FILM_PROJECTION}`,
    { slug },
    { next: { tags: ["film"] } },
  );
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return client.fetch<Testimonial[]>(
    `*[_type == "testimonial"] | order(order asc)${TESTIMONIAL_PROJECTION}`,
    {},
    { next: { tags: ["testimonial"] } },
  );
}

export async function getServices(): Promise<Service[]> {
  return client.fetch<Service[]>(
    `*[_type == "service"] | order(order asc)${SERVICE_PROJECTION}`,
    {},
    { next: { tags: ["service"] } },
  );
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch<SiteSettings | null>(
    `*[_id == "siteSettings"][0]${SITE_SETTINGS_PROJECTION}`,
    {},
    { next: { tags: ["siteSettings"] } },
  );
}
