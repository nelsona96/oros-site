import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import type { Photo } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/photo.jpg" }) }),
  }),
}));

// Mirrors the real browser URL PhotoGallery reads via useSearchParams for
// its initial deep-link lookup — set before render to simulate a deep link,
// left empty (the default) for every other test.
let mockSearch = "";
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

import { PhotoGallery } from "./photo-gallery";

const makePhoto = (id: string, overrides: Partial<Photo> = {}): Photo => ({
  _id: id,
  category: "weddings",
  featured: false,
  image: {
    alt: `Photo ${id}`,
    asset: {
      url: "https://cdn.sanity.io/photo.jpg",
      metadata: { dimensions: { width: 1200, height: 800, aspectRatio: 1.5 }, lqip: "data:image/png;base64,x" },
    },
  },
  ...overrides,
});

const photos: Photo[] = [
  makePhoto("p1", {
    caption: "The first look",
    capture: { camera: "NIKON Z8", lens: "85mm", aperture: "ƒ1.4", shutter: "1/200" },
  }),
  makePhoto("p2"),
  makePhoto("p3", { category: "ministry" }),
];

describe("PhotoGallery", () => {
  afterEach(() => {
    mockSearch = "";
    window.history.replaceState(null, "", "/");
  });

  it("does not render dialog content until a photo is clicked", () => {
    render(<PhotoGallery photos={photos} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the lightbox with the clicked photo's caption and capture metadata", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));
    // The caption also becomes the dialog's (sr-only) accessible title, so
    // scope to the visible caption paragraph specifically.
    expect(screen.getByText("The first look", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("NIKON Z8 · 85mm · ƒ1.4 · 1/200")).toBeInTheDocument();
  });

  it("omits the capture line entirely when no capture data is set", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p2"));
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });

  it("falls back to a category-based accessible name when a photo has no caption", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p2"));
    expect(screen.getByRole("dialog", { name: "Weddings photograph" })).toBeInTheDocument();
  });

  it("disables previous at the first photo and next at the last", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));
    expect(screen.getByRole("button", { name: "Previous photo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next photo" })).not.toBeDisabled();
  });

  it("navigates forward and backward between photos via the chevron buttons", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByRole("button", { name: "Previous photo" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Next photo" })).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(screen.getByRole("button", { name: "Next photo" })).not.toBeDisabled();
  });

  it("navigates with the arrow keys", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Previous photo" })).not.toBeDisabled();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: "Previous photo" })).toBeDisabled();
  });

  it("navigates on a left/right swipe", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));
    const dialog = screen.getByRole("dialog");

    fireEvent.touchStart(dialog, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 100 }] });
    expect(screen.getByRole("button", { name: "Previous photo" })).not.toBeDisabled();
  });

  it("closes via the close button", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("pushes ?photo=<id> onto the URL when a photo is opened, and clears it on close", async () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));
    expect(window.location.search).toBe("?photo=p1");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    // Closing calls history.back() to pop the entry opening pushed, rather
    // than pushing a "closed" entry of its own — jsdom (like real browsers)
    // processes that navigation, and the popstate it fires, asynchronously.
    await waitFor(() => expect(window.location.search).toBe(""));
  });

  it("replaces rather than pushes the URL when navigating prev/next inside the lightbox", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));
    const lengthAfterOpen = window.history.length;

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(window.location.search).toBe("?photo=p2");
    expect(window.history.length).toBe(lengthAfterOpen);
  });

  it("opens directly to the photo named in ?photo=<id> on mount (deep link)", () => {
    mockSearch = "?photo=p3";
    render(<PhotoGallery photos={photos} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("dialog").querySelector('img[aria-hidden="false"]')).toHaveAttribute(
      "alt",
      "Photo p3",
    );
  });

  it("ignores a ?photo=<id> that doesn't match any photo", () => {
    mockSearch = "?photo=does-not-exist";
    render(<PhotoGallery photos={photos} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // Every photo in the filtered set mounts as its own persistent layer once
  // the dialog opens (see LightboxPhotoLayer) — only one is ever the active,
  // visible one at a time, marked aria-hidden="false" (the rest true).
  function activeImage() {
    return screen.getByRole("dialog").querySelector('img[aria-hidden="false"]')!;
  }

  it("shows a spinner while the full-size photo loads, then fades it in once loaded", async () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(activeImage()).toHaveClass("opacity-0");

    // next/image defers onLoad behind an img.decode() microtask, so the
    // resulting state update lands a tick after the native load event.
    fireEvent.load(activeImage());
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(activeImage()).toHaveClass("opacity-100");
  });

  it("shows the spinner again after navigating to a photo that hasn't loaded yet, but not for one already loaded", async () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByAltText("Photo p1"));
    fireEvent.load(activeImage());
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.load(activeImage());
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());

    // Navigating back to p1 — already loaded once, never remounted — should
    // not show the spinner again.
    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(activeImage()).toHaveClass("opacity-100");
  });

  it("filters the grid by category", () => {
    render(<PhotoGallery photos={photos} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Ministry" }));

    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByAltText("Photo p3")).toBeInTheDocument();
  });

  it("shows an empty-state message instead of blank space when a category has no photos", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByRole("button", { name: "Commercial" }));

    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(screen.getByText(/no photos here yet/i)).toBeInTheDocument();
  });

  it("preloads every photo's full-size image up front, unfiltered", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getByRole("button", { name: "Ministry" }));

    const preloadLinks = document.head.querySelectorAll('link[rel="preload"][as="image"]');
    expect(preloadLinks).toHaveLength(photos.length);
  });
});
