import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SiteSettings } from "@/lib/sanity/types";
import { ContactCta } from "./contact-cta";

describe("ContactCta", () => {
  it("always renders the CTA button linking to /contact", () => {
    render(<ContactCta settings={null} />);
    // Button composed onto a Link via Base UI's `render` prop with
    // nativeButton={false} exposes role="button" (its visual affordance),
    // not "link" — the underlying <a href> is still real navigation.
    expect(screen.getByRole("button", { name: /get in touch/i })).toHaveAttribute("href", "/contact");
  });

  it("does not render an Instagram link when no handle is set", () => {
    render(<ContactCta settings={null} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the Instagram link when a handle is set", () => {
    const settings = { name: "Oros Productions", instagramHandle: "orosproductions" } as SiteSettings;
    render(<ContactCta settings={settings} />);
    const igLink = screen.getByRole("link", { name: /@orosproductions/i });
    expect(igLink).toHaveAttribute("href", "https://instagram.com/orosproductions");
    expect(igLink).toHaveAttribute("target", "_blank");
  });
});
