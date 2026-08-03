import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SiteSettings } from "@/lib/sanity/types";

vi.mock("@/lib/sanity/image", () => ({
  urlFor: () => ({
    width: () => ({ quality: () => ({ url: () => "https://cdn.sanity.io/logo.jpg" }) }),
  }),
}));

import { LocalBusinessJsonLd } from "./local-business-jsonld";

function readJsonLd(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]');
  return script ? JSON.parse(script.textContent ?? "{}") : null;
}

describe("LocalBusinessJsonLd", () => {
  it("renders nothing when there are no settings", () => {
    const { container } = render(<LocalBusinessJsonLd settings={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("includes only the fields siteSettings actually has", () => {
    const settings = { name: "Oros Productions" } as SiteSettings;
    const { container } = render(<LocalBusinessJsonLd settings={settings} />);
    const jsonLd = readJsonLd(container);

    expect(jsonLd["@type"]).toBe("LocalBusiness");
    expect(jsonLd.name).toBe("Oros Productions");
    expect(jsonLd.email).toBeUndefined();
    expect(jsonLd.telephone).toBeUndefined();
    expect(jsonLd.sameAs).toBeUndefined();
    expect(jsonLd.image).toBeUndefined();
  });

  it("adds email, phone, image, and the Instagram sameAs URL when present", () => {
    const settings = {
      name: "Oros Productions",
      contactEmail: "hello@oros.test",
      contactPhone: "555-0100",
      instagramHandle: "orosproductions",
      portrait: { asset: { url: "https://cdn.sanity.io/portrait.jpg" } },
    } as unknown as SiteSettings;
    const { container } = render(<LocalBusinessJsonLd settings={settings} />);
    const jsonLd = readJsonLd(container);

    expect(jsonLd.email).toBe("hello@oros.test");
    expect(jsonLd.telephone).toBe("555-0100");
    expect(jsonLd.sameAs).toEqual(["https://instagram.com/orosproductions"]);
    expect(jsonLd.image).toBe("https://cdn.sanity.io/logo.jpg");
  });
});
