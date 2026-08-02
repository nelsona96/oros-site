import type { Service } from "@/lib/sanity/types";
import { Container } from "./container";
import { Section } from "./section";
import { Display, Eyebrow } from "./typography";

/**
 * DESIGN.md §8.3 / §1: the four verticals, named explicitly, are the
 * mechanism that lets one site serve four audiences without visitors
 * guessing whether they're in the right place. §6: no category icons here —
 * text only. Cards don't link anywhere: `/services/[slug]` is explicitly
 * deferred (SPEC.md §3) — the schema just leaves room for it later.
 */
export function Services({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <Section className="bg-app-bg-subtle">
      <Container className="space-y-8">
        <div>
          <Eyebrow>Services</Eyebrow>
          <Display as="h2" className="text-4xl md:text-5xl">
            Four verticals, one studio.
          </Display>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div key={service._id} className="border-border bg-surface rounded-control space-y-2 border p-6">
              <Display as="h3" className="text-2xl text-text-primary">
                {service.title}
              </Display>
              <p className="font-body text-sm text-text-secondary">{service.blurb}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
