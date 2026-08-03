import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { Testimonial } from "@/lib/sanity/types";
import { Container } from "./container";
import { Section } from "./section";
import { Body, Display, Eyebrow } from "./typography";

const AVATAR_SIZE = 96;
const AVATAR_QUALITY = 85;

/**
 * DESIGN.md §8.5: quotes only for now — the client/venue/church marks row
 * is an open content dependency (needs real logos and permission to use
 * them), so it isn't built here.
 *
 * `image` (Phase 12f, added to the schema in 12a) — a circular headshot
 * avatar, not the site's usual radius-0 photograph treatment: this is a
 * portrait-badge identifying who's speaking, the same convention every
 * review/testimonial UI uses, not a piece of portfolio photography.
 * Self-guarded per testimonial ("the mixed state") — not every testimonial
 * will have a photo, and a missing one just means no avatar renders, not a
 * broken image or a placeholder.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <Section className="bg-app-bg-subtle ascent-subtle">
      <Container className="space-y-8">
        <div className="space-y-4">
          <Eyebrow>What Clients Say</Eyebrow>
          <Display as="h2" size="md">
            Kind words from people we&rsquo;ve worked with.
          </Display>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial._id}
              className="border-border bg-surface hover:bg-surface-hover hover:border-border-strong rounded-control space-y-3 border p-6 transition-colors"
            >
              {testimonial.image ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={urlFor(testimonial.image).width(AVATAR_SIZE).quality(AVATAR_QUALITY).url()}
                    alt={testimonial.image.alt ?? ""}
                    fill
                    sizes={`${AVATAR_SIZE}px`}
                    className="object-cover"
                  />
                </div>
              ) : null}
              <Body tone="primary">&ldquo;{testimonial.quote}&rdquo;</Body>
              <Eyebrow as="footer" tone="secondary">
                {testimonial.attribution}
                {testimonial.role ? `, ${testimonial.role}` : null}
              </Eyebrow>
            </blockquote>
          ))}
        </div>
      </Container>
    </Section>
  );
}
