import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Photo } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/photo.jpg" }) }),
  }),
}));

import { JustifiedGrid } from "./justified-grid";

const makePhoto = (id: string, aspectRatio: number, alt: string): Photo => ({
  _id: id,
  category: "weddings",
  featured: false,
  image: {
    alt,
    asset: {
      url: "https://cdn.sanity.io/photo.jpg",
      metadata: {
        dimensions: { width: 1200, height: Math.round(1200 / aspectRatio), aspectRatio },
        lqip: "data:image/png;base64,x",
      },
    },
  },
});

const photos: Photo[] = [makePhoto("p1", 1.5, "A landscape photo"), makePhoto("p2", 0.75, "A portrait photo")];

describe("JustifiedGrid", () => {
  it("renders nothing when there are no photos", () => {
    const { container } = render(<JustifiedGrid photos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one image per photo with its alt text", () => {
    render(<JustifiedGrid photos={photos} />);
    expect(screen.getByAltText("A landscape photo")).toBeInTheDocument();
    expect(screen.getByAltText("A portrait photo")).toBeInTheDocument();
  });

  it("sets flex-basis and flex-grow proportional to each photo's aspect ratio", () => {
    const { container } = render(<JustifiedGrid photos={photos} />);
    const grid = container.firstElementChild!;
    const items = grid.querySelectorAll(":scope > div[style]");
    const [landscape, portrait] = Array.from(items) as HTMLElement[];

    expect(landscape.style.flexGrow).toBe("1.5");
    expect(landscape.style.flexBasis).toBe("calc(var(--row-h) * 1.5)");
    expect(portrait.style.flexGrow).toBe("0.75");
    expect(portrait.style.flexBasis).toBe("calc(var(--row-h) * 0.75)");
  });

  it("appends filler elements so a short last row doesn't stretch a lone image", () => {
    const { container } = render(<JustifiedGrid photos={[photos[0]]} />);
    const fillers = container.querySelectorAll('[aria-hidden="true"]');
    expect(fillers.length).toBeGreaterThan(0);
  });
});
