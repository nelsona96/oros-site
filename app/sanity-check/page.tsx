import Image from "next/image";
import {
  getPhotos,
  getFilms,
  getTestimonials,
  getServices,
  getSiteSettings,
} from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

/**
 * Temporary — proves the Sanity client/queries/revalidation pipeline works
 * end to end (docs/BUILD_PLAN.md Phase 4). Delete once Phases 6-7 build the
 * real landing page against this same data. Not dev-gated like /styleguide:
 * this one needs to be reachable in a production build to test real caching
 * and revalidation behavior, and it's short-lived regardless.
 */
export default async function SanityCheckPage() {

  const [photos, films, testimonials, services, siteSettings] = await Promise.all([
    getPhotos(),
    getFilms(),
    getTestimonials(),
    getServices(),
    getSiteSettings(),
  ]);

  return (
    <main className="bg-app-bg text-text-primary min-h-screen space-y-12 px-8 py-16">
      <h1 className="font-display text-4xl">Sanity check (dev only)</h1>

      <section>
        <h2 className="font-mono text-sm text-text-accent uppercase">Site settings</h2>
        <pre className="mt-2 overflow-x-auto text-xs">
          {JSON.stringify(
            { name: siteSettings?.name, tagline: siteSettings?.tagline },
            null,
            2,
          )}
        </pre>
      </section>

      <section>
        <h2 className="font-mono text-sm text-text-accent uppercase">
          Photos ({photos.length})
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {photos.map((photo) => (
            <div key={photo._id} className="w-40 space-y-1">
              <Image
                src={urlFor(photo.image).width(320).height(320).fit("crop").url()}
                alt={photo.image.alt ?? ""}
                width={320}
                height={320}
                placeholder="blur"
                blurDataURL={photo.image.asset.metadata.lqip}
                className="h-40 w-40 object-cover"
              />
              <p className="font-mono text-xs text-text-secondary">{photo.category}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-mono text-sm text-text-accent uppercase">Films ({films.length})</h2>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          {films.map((film) => (
            <li key={film._id}>
              {film.title} — {film.category} — playbackId: {film.playbackId ?? "none"}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-mono text-sm text-text-accent uppercase">
          Testimonials ({testimonials.length})
        </h2>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          {testimonials.map((t) => (
            <li key={t._id}>
              &quot;{t.quote}&quot; — {t.attribution}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-mono text-sm text-text-accent uppercase">
          Services ({services.length})
        </h2>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          {services.map((s) => (
            <li key={s._id}>
              {s.title} — {s.blurb}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
