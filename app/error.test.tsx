import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RouteError from "./error";

describe("RouteError", () => {
  it("renders the error heading and a link back home", () => {
    render(<RouteError error={new Error("boom")} unstable_retry={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back home/i })).toHaveAttribute("href", "/");
  });

  it("calls unstable_retry when Try again is clicked", () => {
    const unstableRetry = vi.fn();
    render(<RouteError error={new Error("boom")} unstable_retry={unstableRetry} />);
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(unstableRetry).toHaveBeenCalledTimes(1);
  });
});
