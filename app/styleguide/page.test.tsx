import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

    expect(screen.getByText("Scaling new heights in cinematic storytelling.")).toBeInTheDocument();
    expect(screen.getByText("NIKON Z8 · 85MM · ƒ1.4 · 1/200")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Destructive" })).toBeInTheDocument();
  });
});
