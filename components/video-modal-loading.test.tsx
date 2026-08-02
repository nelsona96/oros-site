import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() }),
}));

import { VideoModalLoading } from "./video-modal-loading";

describe("VideoModalLoading", () => {
  it("renders the modal shell with a spinner in place of the player", () => {
    render(<VideoModalLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
