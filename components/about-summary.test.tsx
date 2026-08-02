import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SiteSettings } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/portrait.jpg" }) }),
  }),
}));

import { AboutSummary } from "./about-summary";

const settings: SiteSettings = {
  name: "Oros Productions",
  aboutHeading: "Behind the lens",
  aboutBody: "Two or three sentences about the photographer.",
  portrait: {
    asset: {
      url: "https://cdn.sanity.io/portrait.jpg",
      metadata: { dimensions: { width: 800, height: 1000, aspectRatio: 0.8 }, lqip: "data:image/png;base64,x" },
    },
  },
};

describe("AboutSummary", () => {
  it("renders nothing when settings have no about copy", () => {
    const { container } = render(<AboutSummary settings={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the heading, body, and a link to the full about page", () => {
    render(<AboutSummary settings={settings} />);
    expect(screen.getByRole("heading", { name: settings.aboutHeading! })).toBeInTheDocument();
    expect(screen.getByText(settings.aboutBody!)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read the full story/i })).toHaveAttribute("href", "/about");
  });

  it("renders the portrait when present", () => {
    const { container } = render(<AboutSummary settings={settings} />);
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });
});
