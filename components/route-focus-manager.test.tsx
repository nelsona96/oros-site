import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const usePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

import { RouteFocusManager } from "./route-focus-manager";

describe("RouteFocusManager", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does not focus anything on first render", () => {
    document.body.innerHTML = '<main id="main-content" tabindex="-1"></main>';
    usePathname.mockReturnValue("/");
    render(<RouteFocusManager />);
    expect(document.activeElement).toBe(document.body);
  });

  it("focuses #main-content on a route change, even when a nav link is still focused", () => {
    document.body.innerHTML =
      '<main id="main-content" tabindex="-1"></main><a id="nav-link" href="/about"></a>';
    document.getElementById("nav-link")?.focus();
    usePathname.mockReturnValue("/");
    const { rerender } = render(<RouteFocusManager />);

    usePathname.mockReturnValue("/about");
    rerender(<RouteFocusManager />);

    expect(document.activeElement).toBe(document.getElementById("main-content"));
  });

  it("does not steal focus from an open dialog (e.g. the intercepted video modal)", () => {
    document.body.innerHTML =
      '<main id="main-content" tabindex="-1"></main>' +
      '<div role="dialog"><button id="dialog-btn"></button></div>';
    document.getElementById("dialog-btn")?.focus();
    usePathname.mockReturnValue("/portfolio/videos");
    const { rerender } = render(<RouteFocusManager />);

    usePathname.mockReturnValue("/portfolio/videos/some-film");
    rerender(<RouteFocusManager />);

    expect(document.activeElement).toBe(document.getElementById("dialog-btn"));
  });
});
