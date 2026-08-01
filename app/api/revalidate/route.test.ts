import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { encodeSignatureHeader } from "@sanity/webhook";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag: (...args: unknown[]) => revalidateTag(...args) }));

const SECRET = "test-secret";

async function signedRequest(body: string, secret = SECRET) {
  const signature = await encodeSignatureHeader(body, Date.now(), secret);
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: { "sanity-webhook-signature": signature },
    body,
  });
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    process.env.SANITY_REVALIDATE_SECRET = SECRET;
    revalidateTag.mockClear();
  });

  afterEach(() => {
    delete process.env.SANITY_REVALIDATE_SECRET;
  });

  it("500s when the secret isn't configured", async () => {
    delete process.env.SANITY_REVALIDATE_SECRET;
    const { POST } = await import("./route");
    const res = await POST(await signedRequest(JSON.stringify({ _type: "photo" })));
    expect(res.status).toBe(500);
  });

  it("401s on a missing signature", async () => {
    const { POST } = await import("./route");
    const res = await POST(new Request("http://localhost/api/revalidate", { method: "POST" }));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("401s on an invalid signature", async () => {
    const { POST } = await import("./route");
    const res = await POST(await signedRequest(JSON.stringify({ _type: "photo" }), "wrong-secret"));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("400s on a valid signature with an unknown _type", async () => {
    const { POST } = await import("./route");
    const res = await POST(await signedRequest(JSON.stringify({ _type: "notARealType" })));
    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates the matching tag on a valid, known request", async () => {
    const { POST } = await import("./route");
    const res = await POST(await signedRequest(JSON.stringify({ _type: "photo" })));
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("photo", { expire: 0 });
  });
});
