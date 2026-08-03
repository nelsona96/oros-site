import { describe, expect, it } from "vitest";
import { pageMetadata } from "./metadata";

describe("pageMetadata", () => {
  it("includes title in the page, openGraph, and twitter fields when provided", () => {
    const metadata = pageMetadata({ title: "About", description: "desc", path: "/about" });
    expect(metadata.title).toBe("About");
    expect(metadata.openGraph?.title).toBe("About");
    expect(metadata.twitter?.title).toBe("About");
  });

  it("omits title entirely when not provided, so the root layout's default template applies", () => {
    const metadata = pageMetadata({ description: "desc", path: "/" });
    expect(metadata.title).toBeUndefined();
    expect(metadata.openGraph?.title).toBeUndefined();
    expect(metadata.twitter?.title).toBeUndefined();
  });

  it("sets the canonical alternate and openGraph url from path", () => {
    const metadata = pageMetadata({ description: "desc", path: "/portfolio/photos" });
    expect(metadata.alternates?.canonical).toBe("/portfolio/photos");
    expect(metadata.openGraph?.url).toBe("/portfolio/photos");
  });

  it("carries the same description through every surface", () => {
    const metadata = pageMetadata({ description: "A real description.", path: "/contact" });
    expect(metadata.description).toBe("A real description.");
    expect(metadata.openGraph?.description).toBe("A real description.");
    expect(metadata.twitter?.description).toBe("A real description.");
  });

  it("defaults openGraph/twitter images to the root opengraph-image route", () => {
    const metadata = pageMetadata({ description: "desc", path: "/about" });
    expect(metadata.openGraph?.images).toEqual(["/opengraph-image"]);
    expect(metadata.twitter?.images).toEqual(["/opengraph-image"]);
  });

  it("omits images entirely when image is explicitly null, for a route with its own file-based image", () => {
    const metadata = pageMetadata({ description: "desc", path: "/portfolio/videos/x", image: null });
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
  });
});
