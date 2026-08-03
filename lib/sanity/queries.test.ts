import { afterEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
vi.mock("./client", () => ({
  client: { fetch: (...args: unknown[]) => fetchMock(...args) },
}));

import {
  getFeaturedFilms,
  getFeaturedPhotos,
  getFilmBySlug,
  getFilms,
  getPhotos,
  getServices,
  getSiteSettings,
  getTestimonials,
} from "./queries";

describe("Sanity queries", () => {
  afterEach(() => {
    fetchMock.mockReset();
    vi.restoreAllMocks();
  });

  it("returns the fetched data on success", async () => {
    fetchMock.mockResolvedValue([{ _id: "p1" }]);
    await expect(getPhotos()).resolves.toEqual([{ _id: "p1" }]);
  });

  it.each([
    ["getPhotos", getPhotos, []],
    ["getFeaturedPhotos", getFeaturedPhotos, []],
    ["getFilms", getFilms, []],
    ["getFeaturedFilms", getFeaturedFilms, []],
    ["getTestimonials", getTestimonials, []],
    ["getServices", getServices, []],
  ] as const)("%s degrades to an empty list instead of throwing when the fetch fails", async (_name, fn, fallback) => {
    fetchMock.mockRejectedValue(new Error("Sanity is down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(fn()).resolves.toEqual(fallback);
  });

  it("getFilmBySlug degrades to null instead of throwing when the fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("Sanity is down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(getFilmBySlug("some-slug")).resolves.toBeNull();
  });

  it("getSiteSettings degrades to null instead of throwing when the fetch fails", async () => {
    fetchMock.mockRejectedValue(new Error("Sanity is down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(getSiteSettings()).resolves.toBeNull();
  });

  it("logs the failure rather than swallowing it silently", async () => {
    fetchMock.mockRejectedValue(new Error("Sanity is down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await getPhotos();
    expect(consoleError).toHaveBeenCalled();
  });
});
