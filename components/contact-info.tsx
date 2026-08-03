import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { SiteSettings } from "@/lib/sanity/types";
import { Icon } from "./icon";

const LINK_CLASSES =
  "rounded-control flex w-fit items-center gap-1.5 font-mono text-xs tracking-widest text-text-secondary uppercase transition-colors hover:text-text-accent";

/** Direct alternatives to the form, sourced from `siteSettings.contact*` — self-guards per field, like AboutSummary/ContactCta. */
export function ContactInfo({ settings }: { settings: SiteSettings | null }) {
  if (!settings?.contactEmail && !settings?.contactPhone && !settings?.instagramHandle) return null;

  return (
    <div className="space-y-3">
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
