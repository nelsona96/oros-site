import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SiteSettings } from "@/lib/sanity/types";
import { Container } from "./container";
import { Section } from "./section";
import { Display, Eyebrow } from "./typography";

/**
 * DESIGN.md §8.4 + SPEC.md §4: the full long-form about page, including the
 * faith/mission paragraph (DESIGN.md §1 — "stated plainly ... never preached
 * site-wide"). `aboutLongForm` is the studio-authored copy; falls back to the
 * shorter `aboutBody` teaser if the long form hasn't been filled in yet.
 */
export function AboutContent({ settings }: { settings: SiteSettings | null }) {
  const heading = settings?.aboutHeading ?? settings?.name;
  const body = settings?.aboutLongForm ?? settings?.aboutBody;
  const paragraphs = body?.split(/\n\s*\n/).filter(Boolean) ?? [];
  const portrait = settings?.portrait;
  const portraitUrl = portrait ? urlFor(portrait).width(800).quality(85).url() : undefined;

  return (
    <Section className="pt-8 md:pt-12">
      <Container className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12">
        {portraitUrl && portrait ? (
          <Image
            src={portraitUrl}
            alt={portrait.alt ?? settings?.name ?? "Portrait"}
            width={portrait.asset.metadata.dimensions.width}
            height={portrait.asset.metadata.dimensions.height}
            placeholder="blur"
            blurDataURL={portrait.asset.metadata.lqip}
            className="border-border w-full border"
          />
        ) : null}

        <div className="space-y-4">
          <Eyebrow>About</Eyebrow>
          {heading ? (
            <Display as="h1" className="text-4xl md:text-5xl">
              {heading}
            </Display>
          ) : null}
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="max-w-prose font-body text-text-secondary">
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </Section>
  );
}
