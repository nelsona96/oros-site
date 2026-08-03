"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Body, Display, Eyebrow } from "@/components/typography";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section className="pt-8 md:pt-12">
      <Container className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="space-y-4">
          <Eyebrow>Error</Eyebrow>
          <Display as="h1" size="md">
            Something went wrong.
          </Display>
        </div>
        <Body className="max-w-prose">
          The page hit an unexpected error. Try again, or head back home.
        </Body>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => unstable_retry()}
            className="font-mono text-sm tracking-widest uppercase"
          >
            Try again
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="secondary"
            className="font-mono text-sm tracking-widest uppercase"
          >
            Back home
          </Button>
        </div>
      </Container>
    </Section>
  );
}
