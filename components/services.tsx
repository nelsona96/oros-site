import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { Service } from "@/lib/sanity/types";
import { Container } from "./container";
import { Section } from "./section";
import { Body, Display, Eyebrow } from "./typography";

const COVER_WIDTH = 640;
const COVER_QUALITY = 80;
const COVER_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

/**
 * DESIGN.md §8.3 / §1: the four verticals, named explicitly, are the
 * mechanism that lets one site serve four audiences without visitors
 * guessing whether they're in the right place. §6: no category icons here —
 * text only. Cards don't link anywhere: `/services/[slug]` is explicitly
 * deferred (SPEC.md §3) — the schema just leaves room for it later.
 *
 * `coverImage` (Phase 12f) — the field already existed in the schema,
 * unused until now. `rounded-control` on the card, not radius 0: this is a
 * UI-card thumbnail illustrating the vertical, not a standalone portfolio
 * photograph — the same distinction `VideoCard`'s thumbnail already makes.
 * Self-guarded per card, since a service without a cover image yet is
 * expected, not an error.
 */
export function Services({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <Section className="bg-app-bg-subtle ascent-subtle">
      <Container className="space-y-8">
        <div className="space-y-4">
          <Eyebrow>Services</Eyebrow>
          <Display as="h2" size="md">
            Four verticals, one studio.
          </Display>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="border-border bg-surface hover:bg-surface-hover hover:border-border-strong rounded-control overflow-hidden border transition-colors"
            >
              {service.coverImage ? (
                <div className="relative aspect-video">
                  <Image
                    src={urlFor(service.coverImage).width(COVER_WIDTH).quality(COVER_QUALITY).url()}
                    alt={service.coverImage.alt ?? ""}
                    fill
                    sizes={COVER_SIZES}
                    placeholder={service.coverImage.asset.metadata.lqip ? "blur" : "empty"}
                    blurDataURL={service.coverImage.asset.metadata.lqip}
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="space-y-2 p-6">
                <Display as="h3" size="sm" className="text-text-primary">
                  {service.title}
                </Display>
                <Body size="sm">{service.blurb}</Body>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
