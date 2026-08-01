import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryFilter } from "./category-filter";

describe("CategoryFilter", () => {
  it("links every category to its search param, plus an All link back to the base route", () => {
    render(<CategoryFilter />);
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("href", "/portfolio/photos");
    expect(screen.getByRole("link", { name: "Weddings" })).toHaveAttribute(
      "href",
      "/portfolio/photos?category=weddings",
    );
    expect(screen.getByRole("link", { name: "Commercial" })).toHaveAttribute(
      "href",
      "/portfolio/photos?category=commercial",
    );
    expect(screen.getByRole("link", { name: "Portrait" })).toHaveAttribute(
      "href",
      "/portfolio/photos?category=portrait",
    );
    expect(screen.getByRole("link", { name: "Ministry" })).toHaveAttribute(
      "href",
      "/portfolio/photos?category=ministry",
    );
  });

  it("highlights All when no category is active", () => {
    render(<CategoryFilter />);
    expect(screen.getByRole("link", { name: "All" })).toHaveClass("text-text-light");
    expect(screen.getByRole("link", { name: "Weddings" })).not.toHaveClass("text-text-light");
  });

  it("highlights the active category instead of All", () => {
    render(<CategoryFilter active="ministry" />);
    expect(screen.getByRole("link", { name: "Ministry" })).toHaveClass("text-text-light");
    expect(screen.getByRole("link", { name: "All" })).not.toHaveClass("text-text-light");
  });
});
