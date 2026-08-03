import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { SiteSettings } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

const LINK_CLASSES =
  "rounded-control flex w-fit items-center gap-1.5 font-mono text-xs tracking-widest text-text-secondary uppercase transition-colors hover:text-text-accent";

/**
 * Direct alternatives to the form, sourced from `siteSettings.contact*` —
 * self-guards per field, like AboutSummary/ContactCta. `className` lets a
 * second caller (Footer, Phase 12f) lay the same three links out
 * horizontally instead of the /contact page's default vertical stack,
 * without duplicating the self-guard logic or the mailto:/tel:/Instagram
 * href construction.
 */
export function ContactInfo({
  settings,
  className,
}: {
  settings: SiteSettings | null;
  className?: string;
}) {
  if (!settings?.contactEmail && !settings?.contactPhone && !settings?.instagramHandle) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {settings.contactEmail ? (
        <Link href={`mailto:${settings.contactEmail}`} className={LINK_CLASSES}>
          {settings.contactEmail}
        </Link>
      ) : null}
      {settings.contactPhone ? (
        <Link href={`tel:${settings.contactPhone}`} className={LINK_CLASSES}>
          {settings.contactPhone}
        </Link>
      ) : null}
      {settings.instagramHandle ? (
        <Link
          href={`https://instagram.com/${settings.instagramHandle}`}
          target="_blank"
          rel="noreferrer"
          className={LINK_CLASSES}
        >
          <Icon icon={ExternalLink} size={16} />@{settings.instagramHandle}
        </Link>
      ) : null}
    </div>
  );
}
