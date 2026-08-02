import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SiteSettings } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/portrait.jpg" }) }),
  }),
}));

import { AboutContent } from "./about-content";

const settings: SiteSettings = {
  name: "Oros Productions",
  aboutHeading: "Behind the lens",
  aboutBody: "Two or three sentences about the photographer.",
  aboutLongForm: "First paragraph of the full story.\n\nSecond paragraph, the mission paragraph.",
  portrait: {
    asset: {
      url: "https://cdn.sanity.io/portrait.jpg",
      metadata: { dimensions: { width: 800, height: 1000, aspectRatio: 0.8 }, lqip: "data:image/png;base64,x" },
    },
  },
};

describe("AboutContent", () => {
  it("renders the heading and every long-form paragraph", () => {
    render(<AboutContent settings={settings} />);
    expect(screen.getByRole("heading", { name: settings.aboutHeading! })).toBeInTheDocument();
    expect(screen.getByText("First paragraph of the full story.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph, the mission paragraph.")).toBeInTheDocument();
  });

  it("renders the portrait when present", () => {
    const { container } = render(<AboutContent settings={settings} />);
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("falls back to the short teaser body when long-form copy is missing", () => {
    const settingsWithoutLongForm: SiteSettings = { ...settings };
    delete settingsWithoutLongForm.aboutLongForm;
    render(<AboutContent settings={settingsWithoutLongForm} />);
    expect(screen.getByText(settings.aboutBody!)).toBeInTheDocument();
  });

  it("falls back to the studio name for the heading and skips the portrait when settings are sparse", () => {
    const { container } = render(<AboutContent settings={{ name: "Oros Productions" }} />);
    expect(screen.getByRole("heading", { name: "Oros Productions" })).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("renders without crashing when settings are null", () => {
    const { container } = render(<AboutContent settings={null} />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});
