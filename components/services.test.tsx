import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Service } from "@/lib/sanity/types";
import { Services } from "./services";

const services: Service[] = [
  { _id: "weddings", title: "Weddings & Events", blurb: "Couples, families, celebrations.", slug: "weddings" },
  { _id: "commercial", title: "Commercial & Brand", blurb: "Product, interiors, campaign work.", slug: "commercial" },
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
});
