import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders the 404 heading and links back to the site", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: /this page doesn.t exist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: /view the portfolio/i })).toHaveAttribute(
      "href",
      "/portfolio/photos",
    );
  });
});
