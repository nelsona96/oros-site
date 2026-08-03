import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { SiteSettings } from "@/lib/sanity/types";
import { Container } from "./container";
import { Icon } from "./icon";
import { Section } from "./section";
import { Body, Display, Eyebrow } from "./typography";

/**
 * DESIGN.md §8.4: "their face, their name, two or three sentences" — the
 * highest-converting block for wedding clients, who are hiring a person to
 * be present, not buying image files. Full long-form copy and the mission
 * paragraph are Phase 10a's /about page; this is the teaser leading there.
 */
export function AboutSummary({ settings }: { settings: SiteSettings | null }) {
  const heading = settings?.aboutHeading;
  const body = settings?.aboutBody;
  const portrait = settings?.portrait;
  const portraitUrl = portrait ? urlFor(portrait).width(640).quality(85).url() : undefined;

  if (!heading && !body) return null;

  return (
    <Section>
      <Container className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12">
        {portraitUrl && portrait ? (
          <Image
            src={portraitUrl}
            alt={portrait.alt ?? settings?.name ?? "Portrait"}
            width={portrait.asset.metadata.dimensions.width}
            height={portrait.asset.metadata.dimensions.height}
            placeholder="blur"
            blurDataURL={portrait.asset.metadata.lqip}
            className="reveal border-border w-full border"
          />
        ) : null}

        <div className="space-y-4">
          <Eyebrow>About</Eyebrow>
          {heading ? (
            <Display as="h2" size="md">
              {heading}
            </Display>
          ) : null}
          {body ? <Body className="max-w-prose">{body}</Body> : null}
          <Link
            href="/about"
            className="rounded-control flex w-fit items-center gap-1 font-mono text-xs tracking-widest text-text-primary uppercase transition-colors hover:text-text-accent"
          >
            Read the full story
            <Icon icon={ChevronRight} size={16} />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
