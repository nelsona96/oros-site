import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// next/font/google relies on a build-time SWC transform Next provides; under
// Vitest the raw package export isn't callable. Stub it the same way this
// repo mocks other framework/third-party boundaries (see film-player.test.tsx).
vi.mock("next/font/google", () => {
  const stub = () => ({ className: "mock-font-class" });
  return {
    Instrument_Serif: stub,
    Fraunces: stub,
    Bodoni_Moda: stub,
    DM_Serif_Display: stub,
  };
});

import StyleguidePage from "./page";

describe("StyleguidePage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is not reachable outside development", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => render(<StyleguidePage />)).toThrow();
  });

  it("renders every documented token category and the type scale", () => {
    vi.stubEnv("NODE_ENV", "development");
    render(<StyleguidePage />);

    for (const label of [
      "app-bg",
      "surface",
      "component-accent",
      "border-interactive",
      "ridgeline",
      "accent-solid",
      "light-solid",
      "primary",
      "overlay",
      "focus-ring",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    // The Phase 12b typeface comparison block (below) reuses this same
    // headline/capture copy once per candidate face, so these now appear
    // more than once on the page.
    expect(screen.getAllByText("Scaling new heights in cinematic storytelling.").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("NIKON Z8 · 85MM · ƒ1.4 · 1/200").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Destructive" })).toBeInTheDocument();
  });
});
