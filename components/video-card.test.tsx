import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Film } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({
      quality: () => ({ url: () => "https://cdn.sanity.io/thumb.jpg" }),
    }),
  }),
}));

import { VideoCard } from "./video-card";

const baseFilm: Film = {
  _id: "film-1",
  title: "A Wedding Film",
  slug: "a-wedding-film",
  category: "weddings",
  playbackId: "abc123",
  featured: false,
};

describe("VideoCard", () => {
  it("links to the film's slug", () => {
    render(<VideoCard film={baseFilm} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/portfolio/videos/a-wedding-film",
    );
  });

  it("renders the title and category label", () => {
    render(<VideoCard film={baseFilm} />);
    expect(screen.getByText("A Wedding Film")).toBeInTheDocument();
    expect(screen.getByText("Weddings")).toBeInTheDocument();
  });

  it("formats duration as M:SS", () => {
    render(<VideoCard film={{ ...baseFilm, duration: 125 }} />);
    expect(screen.getByText("2:05")).toBeInTheDocument();
  });

  it("omits the duration badge when duration is missing", () => {
    render(<VideoCard film={baseFilm} />);
    expect(screen.queryByText(/^\d+:\d{2}$/)).not.toBeInTheDocument();
  });

  it("uses the Sanity thumbnail when present", () => {
    render(
      <VideoCard
        film={{
          ...baseFilm,
          thumbnail: {
            asset: {
              url: "https://cdn.sanity.io/thumb.jpg",
              metadata: {
                dimensions: { width: 1600, height: 900, aspectRatio: 16 / 9 },
                lqip: "data:image/png;base64,x",
              },
            },
          },
        }}
      />,
    );
    expect(screen.getByRole("img").getAttribute("src")).toContain(
      encodeURIComponent("https://cdn.sanity.io/thumb.jpg"),
    );
  });

  it("falls back to the Mux poster when no thumbnail is set", () => {
    render(<VideoCard film={baseFilm} />);
    expect(screen.getByRole("img").getAttribute("src")).toContain(
      encodeURIComponent("https://image.mux.com/abc123/thumbnail.jpg"),
    );
  });
});
