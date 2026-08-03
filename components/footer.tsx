import Link from "next/link";
import type { SiteSettings } from "@/lib/sanity/types";
import { Container } from "./container";
import { ContactInfo } from "./contact-info";
import { Ridgeline } from "./ridgeline";
import { RidgelineMark } from "./ridgeline-mark";

const NAV_LINKS = [
  { href: "/portfolio/photos", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const LINK_CLASSES =
  "rounded-control font-mono text-xs tracking-widest uppercase text-text-secondary transition-colors hover:text-text-accent";

/**
 * Phase 12f: built out from the mark + copyright it shipped with into the
 * standard nav/contact/copyright footer, routed through `Container` instead
 * of re-implementing its `mx-auto max-w-6xl px-6 md:px-8` classes by hand.
 * `ContactInfo` is shared with the /contact page rather than duplicating
 * its self-guard and mailto:/tel:/Instagram href logic — only its layout
 * (`space-y-0 flex flex-wrap ...` overriding the page's default vertical
 * stack) differs here.
 */
export function Footer({ settings }: { settings: SiteSettings | null }) {
  return (
    <footer className="bg-app-bg-subtle">
      <Ridgeline />
      <Container className="flex flex-col items-center gap-6 py-12 text-center">
        <RidgelineMark className="h-5 w-auto text-text-secondary" />

        <nav className="flex flex-wrap justify-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={LINK_CLASSES}>
              {link.label}
            </Link>
          ))}
        </nav>

        <ContactInfo settings={settings} className="flex w-auto flex-wrap items-center justify-center gap-6 space-y-0" />

        <p className="font-mono text-xs text-text-secondary">
          © {new Date().getFullYear()} Oros Productions
        </p>
      </Container>
    </footer>
  );
}
