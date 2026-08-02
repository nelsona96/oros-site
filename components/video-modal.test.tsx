import { createElement } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Film } from "@/lib/sanity/types";

const back = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
}));

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({
      quality: () => ({ url: () => "https://cdn.sanity.io/poster.jpg" }),
    }),
  }),
}));

vi.mock("@mux/mux-player-react", () => ({
  default: (props: Record<string, unknown>) =>
    createElement("mux-player", props),
}));

import { VideoModal } from "./video-modal";

const baseFilm: Film = {
  _id: "film-1",
  title: "A Wedding Film",
  slug: "a-wedding-film",
  category: "weddings",
  playbackId: "abc123",
  duration: 125,
  description: "A quiet ceremony at the ridgeline.",
  featured: false,
};

describe("VideoModal", () => {
  it("renders the title, category, duration, and description", () => {
    render(<VideoModal film={baseFilm} />);
    expect(screen.getAllByText("A Wedding Film").length).toBeGreaterThan(0);
    expect(screen.getByText("Weddings · 2:05")).toBeInTheDocument();
    expect(
      screen.getByText("A quiet ceremony at the ridgeline."),
    ).toBeInTheDocument();
  });

  it("omits the description when none is set", () => {
    const { queryByText } = render(
      <VideoModal film={{ ...baseFilm, description: undefined }} />,
    );
    expect(
      queryByText("A quiet ceremony at the ridgeline."),
    ).not.toBeInTheDocument();
  });

  it("shows just the category when duration is missing", () => {
    render(<VideoModal film={{ ...baseFilm, duration: undefined }} />);
    expect(screen.getByText("Weddings")).toBeInTheDocument();
  });

  it("moves focus to the close button on mount", async () => {
    render(<VideoModal film={baseFilm} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Close" })).toHaveFocus(),
    );
  });

  it("calls router.back() when the close button is clicked", () => {
    render(<VideoModal film={baseFilm} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(back).toHaveBeenCalled();
  });

  it("calls router.back() on Escape", () => {
    render(<VideoModal film={baseFilm} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(back).toHaveBeenCalled();
  });
});
