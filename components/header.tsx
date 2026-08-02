"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RidgelineMark } from "./ridgeline-mark";

const NAV_LINKS = [
  { href: "/portfolio/photos", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const LINK_CLASSES =
  "font-mono text-xs tracking-widest uppercase transition-colors rounded-control md:text-sm";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-surface" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link
          href="/"
          aria-label="Oros Productions — home"
          className="text-text-primary rounded-control"
        >
          <RidgelineMark className="h-6 w-auto" />
        </Link>
        <nav className="flex gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${LINK_CLASSES} ${
                  isActive ? "text-text-light" : "text-text-primary hover:text-text-accent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
