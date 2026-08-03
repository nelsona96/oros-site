import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SiteSettings } from "@/lib/sanity/types";
import { Footer } from "./footer";

describe("Footer", () => {
  it("always renders the nav links and copyright", () => {
    render(<Footer settings={null} />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/portfolio/photos");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    expect(screen.getByText(`© ${new Date().getFullYear()} Oros Productions`)).toBeInTheDocument();
  });

  it("renders no contact links when settings has none set", () => {
    render(<Footer settings={null} />);
    // Only the three nav links — no mailto:/tel:/Instagram.
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("renders mailto:, tel:, and Instagram links from settings", () => {
    const settings = {
      name: "Oros Productions",
      contactEmail: "hello@oros.com",
      contactPhone: "555-0100",
      instagramHandle: "orosproductions",
    } as SiteSettings;
    render(<Footer settings={settings} />);

    expect(screen.getByRole("link", { name: "hello@oros.com" })).toHaveAttribute(
      "href",
      "mailto:hello@oros.com",
    );
    expect(screen.getByRole("link", { name: "555-0100" })).toHaveAttribute("href", "tel:555-0100");
    expect(screen.getByRole("link", { name: /@orosproductions/i })).toHaveAttribute(
      "href",
      "https://instagram.com/orosproductions",
    );
  });
});
