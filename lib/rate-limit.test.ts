import { describe, expect, it } from "vitest";
import { isRateLimited } from "./rate-limit";

describe("isRateLimited", () => {
  it("allows requests under the per-window cap", () => {
    const ip = "1.1.1.1";
    expect(isRateLimited(ip, 0)).toBe(false);
    expect(isRateLimited(ip, 1_000)).toBe(false);
    expect(isRateLimited(ip, 2_000)).toBe(false);
  });

  it("blocks once a single IP exceeds the cap within the window", () => {
    const ip = "2.2.2.2";
    isRateLimited(ip, 0);
    isRateLimited(ip, 1_000);
    isRateLimited(ip, 2_000);
    expect(isRateLimited(ip, 3_000)).toBe(true);
  });

  it("resets once requests age out of the window", () => {
    const ip = "3.3.3.3";
    isRateLimited(ip, 0);
    isRateLimited(ip, 1_000);
    isRateLimited(ip, 2_000);
    expect(isRateLimited(ip, 70_000)).toBe(false);
  });

  it("tracks each IP independently", () => {
    const a = "4.4.4.4";
    const b = "5.5.5.5";
    isRateLimited(a, 0);
    isRateLimited(a, 100);
    isRateLimited(a, 200);
    expect(isRateLimited(b, 300)).toBe(false);
  });
});
