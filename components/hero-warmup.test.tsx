import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HeroWarmup } from "./hero-warmup";

const SESSION_KEY = "oros-hero-warmup";

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("reduce") && reduced,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  sessionStorage.clear();
});

describe("HeroWarmup", () => {
  it("renders its children", () => {
    mockMatchMedia(false);
    render(
      <HeroWarmup>
        <p>hero media</p>
      </HeroWarmup>,
    );
    expect(screen.getByText("hero media")).toBeInTheDocument();
  });

  it("plays the media and glow animation and marks the session on first mount", () => {
    mockMatchMedia(false);
    const { container } = render(
      <HeroWarmup>
        <p>hero media</p>
      </HeroWarmup>,
    );
    const [mediaLayer, glowLayer] = container.querySelectorAll(":scope > div");
    expect(mediaLayer).toHaveClass("animate-sunrise-media");
    expect(glowLayer).toHaveClass("animate-sunrise-glow");
    expect(sessionStorage.getItem(SESSION_KEY)).toBe("1");
  });

  it("does not play again once the session is marked", () => {
    mockMatchMedia(false);
    sessionStorage.setItem(SESSION_KEY, "1");
    const { container } = render(
      <HeroWarmup>
        <p>hero media</p>
      </HeroWarmup>,
    );
    const [mediaLayer, glowLayer] = container.querySelectorAll(":scope > div");
    expect(mediaLayer).not.toHaveClass("animate-sunrise-media");
    expect(glowLayer).not.toHaveClass("animate-sunrise-glow");
  });

  it("never plays under prefers-reduced-motion, and does not mark the session", () => {
    mockMatchMedia(true);
    const { container } = render(
      <HeroWarmup>
        <p>hero media</p>
      </HeroWarmup>,
    );
    const [mediaLayer, glowLayer] = container.querySelectorAll(":scope > div");
    expect(mediaLayer).not.toHaveClass("animate-sunrise-media");
    expect(glowLayer).not.toHaveClass("animate-sunrise-glow");
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
