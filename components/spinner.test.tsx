import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("renders an accessible status role with the given label", () => {
    render(<Spinner label="Loading video…" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading video…")).toBeInTheDocument();
  });
});
