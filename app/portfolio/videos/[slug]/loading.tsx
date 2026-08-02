import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Spinner } from "@/components/spinner";
import { Eyebrow } from "@/components/typography";

export default function Loading() {
  return (
    <Section className="pt-8 md:pt-12">
      <Container className="space-y-6">
        <Eyebrow>Portfolio / Videos</Eyebrow>
        <div className="rounded-control bg-surface relative aspect-video overflow-hidden">
          <Spinner label="Loading video…" />
        </div>
      </Container>
    </Section>
  );
}
