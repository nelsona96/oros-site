import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * XML comments can't contain "--" anywhere in their body — a real bug here
 * once made `app/icon.svg` fail to parse under strict XML (confirmed via
 * sharp/librsvg), even though lenient browser SVG parsers rendered it fine.
 * Regression guard: strip the `<!--`/`-->` delimiters themselves before
 * checking, since those legitimately contain "--".
 */
describe("app/icon.svg", () => {
  it("has no double-hyphen inside its comment bodies", () => {
    const svg = readFileSync(join(process.cwd(), "app/icon.svg"), "utf-8");
    const commentBodies = [...svg.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1]);
    expect(commentBodies.length).toBeGreaterThan(0);
    for (const body of commentBodies) {
      expect(body).not.toContain("--");
    }
  });
});
