import { createElement } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Film } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({
      quality: () => ({ url: () => "https://cdn.sanity.io/poster.jpg" }),
    }),
  }),
}));

// The real `<mux-player>` custom element runs browser-only rendering logic
// (media-chrome's shadow DOM templating) that throws in jsdom — stubbing it
// out here is the same "mock the external boundary" move as this repo's
// `next/navigation` mocks, just for a third-party web component instead.
vi.mock("@mux/mux-player-react", () => ({
  default: (props: Record<string, unknown>) =>
    createElement("mux-player", props),
}));

import { FilmPlayer } from "./film-player";

const baseFilm: Film = {
  _id: "film-1",
  title: "A Wedding Film",
  slug: "a-wedding-film",
  category: "weddings",
  playbackId: "abc123",
  featured: false,
};

describe("FilmPlayer", () => {
  it("wires the playback ID onto the underlying mux-player element", () => {
    const { container } = render(<FilmPlayer film={baseFilm} />);
    const player = container.querySelector("mux-player");
    expect(player).not.toBeNull();
    expect(player).toHaveAttribute("playbackid", "abc123");
  });

  it("passes the Sanity thumbnail as the poster when present", () => {
    const { container } = render(
      <FilmPlayer
        film={{
          ...baseFilm,
          thumbnail: {
            asset: {
              url: "https://cdn.sanity.io/poster.jpg",
              metadata: {
                dimensions: { width: 1600, height: 900, aspectRatio: 16 / 9 },
                lqip: "data:image/png;base64,x",
              },
            },
          },
        }}
      />,
    );
    expect(container.querySelector("mux-player")).toHaveAttribute(
      "poster",
      "https://cdn.sanity.io/poster.jpg",
    );
  });

  it("omits the poster attribute when there's no Sanity thumbnail, so mux falls back to its own", () => {
    const { container } = render(<FilmPlayer film={baseFilm} />);
    expect(container.querySelector("mux-player")).not.toHaveAttribute("poster");
  });

  it("overrides media-chrome's default blue focus ring with the site's accent color", () => {
    const { container } = render(<FilmPlayer film={baseFilm} />);
    const style = container.querySelector("mux-player")?.getAttribute("style");
    expect(style).toContain("--media-focus-box-shadow: inset 0 0 0 2px var(--light-solid)");
  });

  it("renders a captions track when the film has one", () => {
    const { container } = render(
      <FilmPlayer film={{ ...baseFilm, captionsUrl: "https://cdn.sanity.io/captions.vtt" }} />,
    );
    const track = container.querySelector("track");
    expect(track).toHaveAttribute("kind", "captions");
    expect(track).toHaveAttribute("src", "https://cdn.sanity.io/captions.vtt");
  });

  it("omits the track element when the film has no captions", () => {
    const { container } = render(<FilmPlayer film={baseFilm} />);
    expect(container.querySelector("track")).toBeNull();
  });
});
