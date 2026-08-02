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
      <Container className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_minmax(0,320px)]">
        <div className="max-w-xl space-y-8">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <Display as="h1" className="text-4xl md:text-5xl">
              Let&rsquo;s build something worth remembering.
            </Display>
          </div>
          <ContactForm />
        </div>
        <ContactInfo settings={settings} />
      </Container>
    </Section>
  );
}
