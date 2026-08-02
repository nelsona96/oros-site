import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portfolio/photos",
}));

import { PortfolioTabs } from "./portfolio-tabs";

describe("PortfolioTabs", () => {
  it("highlights the tab matching the current path with the amber underline", () => {
    render(<PortfolioTabs />);
    expect(screen.getByRole("link", { name: "Photos" })).toHaveClass("border-light-solid");
    expect(screen.getByRole("link", { name: "Videos" })).not.toHaveClass("border-light-solid");
  });

  it("links to /portfolio/photos and /portfolio/videos", () => {
    render(<PortfolioTabs />);
    expect(screen.getByRole("link", { name: "Photos" })).toHaveAttribute("href", "/portfolio/photos");
    expect(screen.getByRole("link", { name: "Videos" })).toHaveAttribute("href", "/portfolio/videos");
  });
});
