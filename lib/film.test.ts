import { describe, expect, it } from "vitest";
import { categoryLabel, formatDuration } from "./film";

describe("categoryLabel", () => {
  it("looks up the display label for a category value", () => {
    expect(categoryLabel("weddings")).toBe("Weddings");
    expect(categoryLabel("ministry")).toBe("Ministry");
  });
});

describe("formatDuration", () => {
  it("formats seconds as M:SS", () => {
    expect(formatDuration(125)).toBe("2:05");
    expect(formatDuration(62)).toBe("1:02");
  });

  it("floors fractional seconds", () => {
    expect(formatDuration(59.9)).toBe("0:59");
  });

  it("handles durations under a minute", () => {
    expect(formatDuration(9)).toBe("0:09");
  });
});
