"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/portfolio/photos", label: "Photos" },
  { href: "/portfolio/videos", label: "Videos" },
];

/**
 * DESIGN.md §9: "Two tabs, never mixed." The active tab gets an amber
 * underline — DESIGN.md §4 names "active tab underline" as one of the few
 * sanctioned full-strength `--light-solid` uses, distinct from the header
 * nav's plain text-color active state.
 */
export function PortfolioTabs() {
  const pathname = usePathname();

  return (
    <nav className="border-border flex gap-6 border-b">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`ring-focus-ring rounded-control -mb-px border-b-2 px-1 pb-3 font-mono text-xs tracking-widest uppercase outline-none transition-colors focus-visible:ring-2 ${
              isActive
                ? "border-light-solid text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
