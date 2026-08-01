import type { Testimonial } from "@/lib/sanity/types";
import { Container } from "./container";
import { Section } from "./section";
import { Display, Eyebrow } from "./typography";

/**
 * DESIGN.md §8.5: quotes only for now — the client/venue/church marks row
 * is an open content dependency (needs real logos and permission to use
 * them), so it isn't built here.
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <Section className="bg-app-bg-subtle">
      <Container className="space-y-8">
        <div>
          <Eyebrow>What Clients Say</Eyebrow>
          <Display as="h2" className="text-4xl md:text-5xl">
            Kind words from people we&rsquo;ve worked with.
          </Display>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial._id}
              className="border-border bg-surface rounded-control space-y-3 border p-6"
            >
              <p className="font-body text-text-primary">&ldquo;{testimonial.quote}&rdquo;</p>
              <footer className="font-mono text-xs tracking-widest text-text-secondary uppercase">
                {testimonial.attribution}
                {testimonial.role ? `, ${testimonial.role}` : null}
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </Section>
  );
}
