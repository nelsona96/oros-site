import type { Metadata } from "next";

export const DEFAULT_DESCRIPTION =
  "Photography and videography for weddings, commercial work, portraiture, and ministry film.";

/**
 * Shared shape for every route's `generateMetadata` — title/description feed
 * both the `<title>`/meta description and the openGraph/twitter previews, so
 * a shared link shows the same thing a browser tab does. `title` omitted
 * (home page) falls through to the root layout's `title.template` default.
 *
 * `image` defaults to the root `opengraph-image.tsx` — Next's file-convention
 * image only auto-attaches to a route that doesn't otherwise define its own
 * `openGraph` object; once a route returns one (as every route here does, for
 * per-page title/description), the inherited image is dropped unless named
 * explicitly. Pass `image: null` for a route with its own sibling
 * `opengraph-image.tsx` (e.g. the film page), which attaches correctly on
 * its own and would otherwise be overridden by the generic default here.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = "/opengraph-image",
}: {
  title?: string;
  description: string;
  path: string;
  image?: string | null;
}): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      ...(title ? { title } : {}),
      description,
      url: path,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
