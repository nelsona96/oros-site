import { render } from "@testing-library/react";
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
  it("plays and marks the session on first mount", () => {
    mockMatchMedia(false);
    const { container } = render(<HeroWarmup />);
    expect(container.firstChild).toHaveClass("animate-sunrise");
    expect(sessionStorage.getItem(SESSION_KEY)).toBe("1");
  });

  it("does not play again once the session is marked", () => {
    mockMatchMedia(false);
    sessionStorage.setItem(SESSION_KEY, "1");
    const { container } = render(<HeroWarmup />);
    expect(container.firstChild).not.toHaveClass("animate-sunrise");
  });

  it("never plays under prefers-reduced-motion, and does not mark the session", () => {
    mockMatchMedia(true);
    const { container } = render(<HeroWarmup />);
    expect(container.firstChild).not.toHaveClass("animate-sunrise");
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
