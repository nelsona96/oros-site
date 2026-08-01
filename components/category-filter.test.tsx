import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryFilter } from "./category-filter";

describe("CategoryFilter", () => {
  it("renders All plus every category as buttons, not links", () => {
    render(<CategoryFilter onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weddings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Commercial" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Portrait" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ministry" })).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("highlights All when no category is active", () => {
    render(<CategoryFilter onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toHaveClass("text-text-light");
    expect(screen.getByRole("button", { name: "Weddings" })).not.toHaveClass("text-text-light");
  });

  it("highlights the active category instead of All", () => {
    render(<CategoryFilter active="ministry" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Ministry" })).toHaveClass("text-text-light");
    expect(screen.getByRole("button", { name: "All" })).not.toHaveClass("text-text-light");
  });

  it("calls onSelect with the clicked category, or undefined for All", () => {
    const onSelect = vi.fn();
    render(<CategoryFilter active="ministry" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Weddings" }));
    expect(onSelect).toHaveBeenCalledWith("weddings");
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onSelect).toHaveBeenCalledWith(undefined);
  });
});
