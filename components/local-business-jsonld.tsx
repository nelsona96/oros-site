import type { SiteSettings } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import { SITE_URL } from "@/lib/site";

/**
 * Partial LocalBusiness JSON-LD — siteSettings has no address/geo/hours
 * fields yet (Phase 13 decision: ship with what's available rather than
 * add schema scope). Add those fields to studio/schemaTypes/siteSettings.ts
 * and extend this once they exist.
 */
export function LocalBusinessJsonLd({ settings }: { settings: SiteSettings | null }) {
  if (!settings) return null;

  const image = settings.ogImage ?? settings.portrait;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.name,
    url: SITE_URL,
    ...(settings.tagline ? { description: settings.tagline } : {}),
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    ...(settings.contactPhone ? { telephone: settings.contactPhone } : {}),
    ...(image ? { image: urlFor(image).width(1200).quality(80).url() } : {}),
    ...(settings.instagramHandle
      ? { sameAs: [`https://instagram.com/${settings.instagramHandle}`] }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
