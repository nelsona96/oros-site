import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Service } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/cover.jpg" }) }),
  }),
}));

import { Services } from "./services";

const services: Service[] = [
  { _id: "weddings", title: "Weddings & Events", blurb: "Couples, families, celebrations.", slug: "weddings" },
  {
    _id: "commercial",
    title: "Commercial & Brand",
    blurb: "Product, interiors, campaign work.",
    slug: "commercial",
    coverImage: {
      alt: "A commercial product shoot",
      asset: {
        url: "https://cdn.sanity.io/cover.jpg",
        metadata: { dimensions: { width: 1200, height: 675, aspectRatio: 16 / 9 }, lqip: "data:image/png;base64,x" },
      },
    },
  },
];

describe("Services", () => {
  it("renders nothing when there are no services", () => {
    const { container } = render(<Services services={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders every service's title and blurb", () => {
    render(<Services services={services} />);
    for (const service of services) {
      expect(screen.getByText(service.title)).toBeInTheDocument();
      expect(screen.getByText(service.blurb)).toBeInTheDocument();
    }
  });

  it("does not render any links or icons — categories are text only per DESIGN.md §6", () => {
    render(<Services services={services} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(document.querySelector("svg")).toBeNull();
  });

  it("renders a cover image only for the service that has one", () => {
    render(<Services services={services} />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByAltText("A commercial product shoot")).toBeInTheDocument();
  });
});
