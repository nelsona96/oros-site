import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ContactInfo } from "@/components/contact-info";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Display, Eyebrow } from "@/components/typography";
import { getSiteSettings } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Get in touch about weddings, commercial work, portraits, or ministry film.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <Section className="pt-8 md:pt-12">
      <Container>
        <div className="mx-auto max-w-xl space-y-10">
          <div className="space-y-4">
            <Eyebrow>Contact</Eyebrow>
            <Display as="h1" size="md">
              Let&rsquo;s build something worth remembering.
            </Display>
          </div>
          <ContactForm />
          <ContactInfo settings={settings} />
        </div>
      </Container>
    </Section>
  );
}
