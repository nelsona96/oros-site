import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}));

const isRateLimitedMock = vi.fn().mockReturnValue(false);
vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: (...args: unknown[]) => isRateLimitedMock(...args),
}));

const validBody = {
  name: "Jamie",
  email: "jamie@example.com",
  phone: "555-0100",
  inquiryType: "weddings",
  location: "Asheville, NC",
  eventDate: "2026-09-12",
  budget: "$5,000–$10,000",
  message: "We're planning a fall wedding and would love to talk about coverage.",
  company: "",
};

function request(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "9.9.9.9" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.CONTACT_TO_EMAIL = "studio@example.com";
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email_123" }, error: null });
    isRateLimitedMock.mockReset();
    isRateLimitedMock.mockReturnValue(false);
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
  });

  it("429s when the IP is rate limited, without calling Resend", async () => {
    isRateLimitedMock.mockReturnValue(true);
    const { POST } = await import("./route");
    const res = await POST(request(validBody));
    expect(res.status).toBe(429);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("400s on an invalid submission, without calling Resend", async () => {
    const { POST } = await import("./route");
    const res = await POST(request({ ...validBody, email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("reports success without calling Resend when the honeypot is filled", async () => {
    const { POST } = await import("./route");
    const res = await POST(request({ ...validBody, company: "Acme Bots Inc" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("500s when Resend or the destination inbox isn't configured", async () => {
    delete process.env.RESEND_API_KEY;
    const { POST } = await import("./route");
    const res = await POST(request(validBody));
    expect(res.status).toBe(500);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends via Resend with reply-to set to the submitter on a valid submission", async () => {
    const { POST } = await import("./route");
    const res = await POST(request(validBody));
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "studio@example.com",
        replyTo: "jamie@example.com",
        subject: expect.stringContaining("Weddings"),
        text: expect.stringContaining("Phone: 555-0100"),
      }),
    );
  });

  it("includes location and budget in the email body when provided", async () => {
    const { POST } = await import("./route");
    await POST(request(validBody));
    const sentText = sendMock.mock.calls[0][0].text as string;
    expect(sentText).toContain("Location: Asheville, NC");
    expect(sentText).toContain("Budget: $5,000–$10,000");
  });

  it("omits optional fields from the email body when they aren't provided", async () => {
    const minimalBody = { ...validBody };
    delete (minimalBody as Partial<typeof validBody>).phone;
    delete (minimalBody as Partial<typeof validBody>).location;
    delete (minimalBody as Partial<typeof validBody>).budget;
    const { POST } = await import("./route");
    await POST(request(minimalBody));
    const sentText = sendMock.mock.calls[0][0].text as string;
    expect(sentText).not.toContain("Phone:");
    expect(sentText).not.toContain("Location:");
    expect(sentText).not.toContain("Budget:");
  });

  it("502s when Resend reports an error", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "invalid sender" } });
    const { POST } = await import("./route");
    const res = await POST(request(validBody));
    expect(res.status).toBe(502);
  });
});
