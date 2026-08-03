import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Film, Photo } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/thumb.jpg" }) }),
  }),
}));

import { SelectedWork } from "./selected-work";

const image = (aspectRatio = 1.5) => ({
  asset: {
    url: "https://cdn.sanity.io/thumb.jpg",
    metadata: {
      dimensions: { width: 1200, height: Math.round(1200 / aspectRatio), aspectRatio },
      lqip: "data:image/png;base64,x",
    },
  },
});

const photo: Photo = {
  _id: "photo-1",
  image: image(),
  category: "weddings",
  featured: true,
};

const filmWithThumbnail: Film = {
  _id: "film-1",
  title: "A Wedding Film",
  slug: "a-wedding-film",
  category: "weddings",
  playbackId: "abc123",
  thumbnail: image(16 / 9),
  featured: true,
};

const filmWithoutThumbnail: Film = {
  _id: "film-2",
  title: "No Thumbnail Film",
  slug: "no-thumbnail-film",
  category: "commercial",
  playbackId: "def456",
  featured: true,
};

describe("SelectedWork", () => {
  it("renders nothing when there are no photos and no films with a thumbnail", () => {
    const { container } = render(<SelectedWork photos={[]} films={[filmWithoutThumbnail]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a photo and links to the full portfolio", () => {
    const { container } = render(<SelectedWork photos={[photo]} films={[]} />);
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /view the full portfolio/i })).toHaveAttribute(
      "href",
      "/portfolio/photos",
    );
  });

  it("deep-links each featured photo into the portfolio's own lightbox", () => {
    const { container } = render(<SelectedWork photos={[photo]} films={[]} />);
    const photoLink = container.querySelector("img")?.closest("a");
    expect(photoLink).toHaveAttribute("href", "/portfolio/photos?photo=photo-1");
  });

  it("renders a film with a thumbnail and skips one without", () => {
    const { container } = render(<SelectedWork photos={[]} films={[filmWithThumbnail, filmWithoutThumbnail]} />);
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByText("Film")).toBeInTheDocument();
  });
});
