import { ContactForm } from "@/components/contact-form";
import { ContactInfo } from "@/components/contact-info";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Display, Eyebrow } from "@/components/typography";
import { getSiteSettings } from "@/lib/sanity/queries";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <Section className="pt-8 md:pt-12">
      <Container>
        <div className="mx-auto max-w-xl space-y-10">
          <div className="space-y-4">
            <Eyebrow>Contact</Eyebrow>
            <Display as="h1" className="text-4xl md:text-5xl">
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
