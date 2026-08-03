import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const usePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

import { Header } from "./header";

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", { value, configurable: true });
}

describe("Header", () => {
  it("highlights the nav link matching the current path", () => {
    usePathname.mockReturnValue("/portfolio/photos");
    render(<Header />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveClass("text-text-light");
    expect(screen.getByRole("link", { name: "About" })).not.toHaveClass("text-text-light");
    expect(screen.getByRole("link", { name: "Contact" })).not.toHaveClass("text-text-light");
  });

  it("keeps Work highlighted on /portfolio/videos, even though it links to /portfolio/photos", () => {
    usePathname.mockReturnValue("/portfolio/videos");
    render(<Header />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveClass("text-text-light");
  });

  it("is transparent at the top and gains a surface background on scroll", () => {
    usePathname.mockReturnValue("/portfolio/photos");
    setScrollY(0);
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-transparent");

    setScrollY(100);
    fireEvent.scroll(window);
    expect(header).toHaveClass("bg-surface");
  });
});
