import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Testimonial } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/avatar.jpg" }) }),
  }),
}));

import { Testimonials } from "./testimonials";

const testimonials: Testimonial[] = [
  {
    _id: "t1",
    quote: "They made our day feel effortless.",
    attribution: "Alex & Sam",
    role: "Wedding client",
    image: {
      alt: "Alex and Sam",
      asset: {
        url: "https://cdn.sanity.io/avatar.jpg",
        metadata: { dimensions: { width: 400, height: 400, aspectRatio: 1 }, lqip: "data:image/png;base64,x" },
      },
    },
  },
  { _id: "t2", quote: "Studio-grade work, every time.", attribution: "Jordan Lee" },
];

describe("Testimonials", () => {
  it("renders nothing when there are no testimonials", () => {
    const { container } = render(<Testimonials testimonials={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders every quote with its attribution and optional role", () => {
    render(<Testimonials testimonials={testimonials} />);
    expect(screen.getByText(/they made our day feel effortless/i)).toBeInTheDocument();
    expect(screen.getByText("Alex & Sam, Wedding client")).toBeInTheDocument();
    expect(screen.getByText(/studio-grade work/i)).toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
  });

  it("renders an avatar only for the testimonial that has one — the mixed state", () => {
    render(<Testimonials testimonials={testimonials} />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByAltText("Alex and Sam")).toBeInTheDocument();
  });
});
