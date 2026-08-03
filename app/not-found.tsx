import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Body, Display, Eyebrow } from "@/components/typography";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Section className="pt-8 md:pt-12">
      <Container className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="space-y-4">
          <Eyebrow>404</Eyebrow>
          <Display as="h1" size="md">
            This page doesn&rsquo;t exist.
          </Display>
        </div>
        <Body className="max-w-prose">
          The link may be outdated, or the page has moved. Try the portfolio, or head back
          home.
        </Body>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="font-mono text-sm tracking-widest uppercase"
          >
            Back home
          </Button>
          <Button
            render={<Link href="/portfolio/photos" />}
            nativeButton={false}
            variant="secondary"
            className="font-mono text-sm tracking-widest uppercase"
          >
            View the portfolio
          </Button>
        </div>
      </Container>
    </Section>
  );
}
