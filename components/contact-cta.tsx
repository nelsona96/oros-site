import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { SiteSettings } from "@/lib/sanity/types";
import { Container } from "./container";
import { Icon } from "./icon";
import { Section } from "./section";
import { Display, Eyebrow } from "./typography";
import { Button } from "./ui/button";

/**
 * DESIGN.md §3/§8.6: "the summit is the CTA" — the warmest surfaces and the
 * one full-strength amber element on the page, the payoff of the ascent.
 * The actual form is Phase 10b's /contact page; this is the prompt that
 * sends people there.
 */
export function ContactCta({ settings }: { settings: SiteSettings | null }) {
  return (
    <Section className="bg-surface">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Eyebrow>Contact</Eyebrow>
        <Display as="h2" className="max-w-2xl text-4xl md:text-6xl">
          Let&rsquo;s build something worth remembering.
        </Display>
        <p className="max-w-prose font-body text-text-secondary">
          Weddings, commercial work, portraits, or ministry film — tell us what you&rsquo;re planning.
        </p>
        <Button
          render={<Link href="/contact" />}
          nativeButton={false}
          size="lg"
          className="h-11 gap-2 bg-light-solid px-8 font-mono text-sm tracking-widest text-text-on-light-solid uppercase hover:bg-light-solid-hover"
        >
          Get in touch
        </Button>
        {settings?.instagramHandle ? (
          <Link
            href={`https://instagram.com/${settings.instagramHandle}`}
            target="_blank"
            rel="noreferrer"
            className="ring-focus-ring rounded-control flex items-center gap-1.5 font-mono text-xs tracking-widest text-text-secondary uppercase outline-none transition-colors hover:text-text-accent focus-visible:ring-2"
          >
            <Icon icon={ExternalLink} size={16} />@{settings.instagramHandle}
          </Link>
        ) : null}
      </Container>
    </Section>
  );
}
