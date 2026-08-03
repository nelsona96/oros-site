import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SiteSettings } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/poster.jpg" }) }),
  }),
}));

// jsdom doesn't implement video playback ("Not implemented: HTMLMediaElement's
// play() method") — stub it the same way this repo mocks other browser/
// framework boundaries it can't run for real in tests.
HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

import { Hero } from "./hero";

const baseSettings: SiteSettings = {
  name: "Oros Productions",
  tagline: "Scaling new heights in cinematic storytelling.",
  heroVideoUrl: "https://cdn.sanity.io/hero.mp4",
  heroPoster: {
    asset: {
      url: "https://cdn.sanity.io/poster.jpg",
      metadata: { dimensions: { width: 1920, height: 1080, aspectRatio: 16 / 9 }, lqip: "data:image/png;base64,x" },
    },
  },
};

describe("Hero", () => {
  it("renders the studio name and tagline from settings", () => {
    render(<Hero settings={baseSettings} />);
    expect(screen.getByRole("heading", { name: "Oros Productions" })).toBeInTheDocument();
    expect(screen.getByText(baseSettings.tagline!)).toBeInTheDocument();
  });

  it("renders the video with a poster and no controls when a loop is set", () => {
    const { container } = render(<Hero settings={baseSettings} />);
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).not.toHaveAttribute("controls");
    expect(video).toHaveAttribute("autoplay");
    // React sets `muted` as a DOM property rather than an HTML attribute.
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect(video).toHaveAttribute("loop");
  });

  it("falls back to a default name and no video when settings are null", () => {
    const { container } = render(<Hero settings={null} />);
    expect(screen.getByRole("heading", { name: "Oros Productions" })).toBeInTheDocument();
    expect(container.querySelector("video")).toBeNull();
  });

  it("falls back to the poster image when the browser blocks autoplay", async () => {
    const resolvedPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = vi.fn().mockRejectedValue(new DOMException("blocked", "NotAllowedError"));

    const { container } = render(<Hero settings={baseSettings} />);
    await waitFor(() => expect(container.querySelector("video")).toHaveClass("hidden"));
    expect(container.querySelector("img")).not.toHaveClass("hidden");

    HTMLMediaElement.prototype.play = resolvedPlay;
  });
});
