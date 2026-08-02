import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SanityImage } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/photo.jpg" }) }),
  }),
}));

import { JustifiedGrid, type JustifiedGridItem } from "./justified-grid";

const makeImage = (aspectRatio: number): SanityImage => ({
  asset: {
    url: "https://cdn.sanity.io/photo.jpg",
    metadata: {
      dimensions: { width: 1200, height: Math.round(1200 / aspectRatio), aspectRatio },
      lqip: "data:image/png;base64,x",
    },
  },
});

const items: JustifiedGridItem[] = [
  { id: "p1", image: makeImage(1.5), alt: "A landscape photo" },
  { id: "p2", image: makeImage(0.75), alt: "A portrait photo" },
];
const noop = () => {};

describe("JustifiedGrid", () => {
  it("renders nothing when there are no items", () => {
    const { container } = render(<JustifiedGrid items={[]} onItemClick={noop} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one image per item with its alt text", () => {
    render(<JustifiedGrid items={items} onItemClick={noop} />);
    expect(screen.getByAltText("A landscape photo")).toBeInTheDocument();
    expect(screen.getByAltText("A portrait photo")).toBeInTheDocument();
  });

  it("sets flex-basis, flex-grow, and aspect-ratio proportional to each item's aspect ratio", () => {
    const { container } = render(<JustifiedGrid items={items} onItemClick={noop} />);
    const grid = container.firstElementChild!;
    const buttons = grid.querySelectorAll(":scope > button[style]");
    const [landscape, portrait] = Array.from(buttons) as HTMLElement[];

    expect(landscape.style.flexGrow).toBe("1.5");
    expect(landscape.style.flexBasis).toBe("calc(var(--row-h) * 1.5)");
    expect(landscape.style.aspectRatio).toBe("1.5 / 1");
    expect(portrait.style.flexGrow).toBe("0.75");
    expect(portrait.style.flexBasis).toBe("calc(var(--row-h) * 0.75)");
    expect(portrait.style.aspectRatio).toBe("0.75 / 1");
  });

  it("renders images with object-contain so nothing is ever cropped", () => {
    render(<JustifiedGrid items={items} onItemClick={noop} />);
    expect(screen.getByAltText("A landscape photo")).toHaveClass("object-contain");
  });

  it("appends filler elements so a short last row doesn't stretch a lone image", () => {
    const { container } = render(<JustifiedGrid items={[items[0]]} onItemClick={noop} />);
    const fillers = container.querySelectorAll('[aria-hidden="true"]');
    expect(fillers.length).toBeGreaterThan(0);
  });

  it("calls onItemClick with the clicked item's index", () => {
    const onItemClick = vi.fn();
    render(<JustifiedGrid items={items} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByAltText("A portrait photo"));
    expect(onItemClick).toHaveBeenCalledWith(1);
  });

  it("shows a pointer cursor on hover", () => {
    render(<JustifiedGrid items={items} onItemClick={noop} />);
    expect(screen.getByAltText("A landscape photo").closest("button")).toHaveClass("cursor-pointer");
  });

  it("roves focus between items with the arrow keys", () => {
    render(<JustifiedGrid items={items} onItemClick={noop} />);
    const first = screen.getByAltText("A landscape photo").closest("button")!;
    const second = screen.getByAltText("A portrait photo").closest("button")!;

    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toBe(second);

    fireEvent.keyDown(second, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(first);
  });

  it("renders a plain non-interactive div per item when onItemClick is omitted", () => {
    const { container } = render(<JustifiedGrid items={items} />);
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(screen.getByAltText("A landscape photo").closest("div[style]")).not.toBeNull();
  });

  it("renders an item's overlay", () => {
    const withOverlay: JustifiedGridItem[] = [
      { id: "f1", image: makeImage(16 / 9), alt: "A film", overlay: <span>Film</span> },
    ];
    render(<JustifiedGrid items={withOverlay} />);
    expect(screen.getByText("Film")).toBeInTheDocument();
  });
});
