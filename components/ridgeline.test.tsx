import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Ridgeline } from "./ridgeline";

describe("Ridgeline", () => {
  it("places the amber highlight at the default 35% position", () => {
    const { container } = render(<Ridgeline />);
    const divider = container.firstChild as HTMLElement;
    expect(divider.style.backgroundImage).toContain("var(--light-solid) 35%");
    expect(divider.style.backgroundImage).toContain("var(--rule-ridgeline) 27%");
    expect(divider.style.backgroundImage).toContain("var(--rule-ridgeline) 43%");
  });

  it("clamps the spread to the 0-100 range at the edges", () => {
    const { container } = render(<Ridgeline position={2} />);
    const divider = container.firstChild as HTMLElement;
    expect(divider.style.backgroundImage).toContain("var(--rule-ridgeline) 0%");
    expect(divider.style.backgroundImage).toContain("var(--light-solid) 2%");
  });
});
