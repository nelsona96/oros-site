import { render } from "@testing-library/react";
import { Play, X } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon";

describe("Icon", () => {
  it("defaults to a 1.5 stroke width and 20px size", () => {
    const { container } = render(<Icon icon={Play} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("stroke-width", "1.5");
    expect(svg).toHaveAttribute("width", "20");
    expect(svg).toHaveAttribute("height", "20");
  });

  it("allows overriding size while keeping the default stroke width", () => {
    const { container } = render(<Icon icon={X} size={16} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("stroke-width", "1.5");
    expect(svg).toHaveAttribute("width", "16");
  });
});
