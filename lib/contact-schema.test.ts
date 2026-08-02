import { describe, expect, it } from "vitest";
import { contactSchema } from "./contact-schema";

const valid = {
  name: "Jamie",
  email: "jamie@example.com",
  inquiryType: "weddings" as const,
  eventDate: "2026-09-12",
  message: "We're planning a fall wedding and would love to talk about coverage.",
  company: "",
};

describe("contactSchema", () => {
  it("accepts a fully valid submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a valid submission with no event date", () => {
    const withoutEventDate: Partial<typeof valid> = { ...valid };
    delete withoutEventDate.eventDate;
    expect(contactSchema.safeParse(withoutEventDate).success).toBe(true);
  });

  it("rejects a blank name", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an inquiry type outside the four verticals", () => {
    const result = contactSchema.safeParse({ ...valid, inquiryType: "landscape" });
    expect(result.success).toBe(false);
  });

  it("rejects a message that's too short to be a real inquiry", () => {
    const result = contactSchema.safeParse({ ...valid, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("accepts a filled-in honeypot at the schema level — detecting it is /api/contact's job, not validation's", () => {
    const result = contactSchema.safeParse({ ...valid, company: "Acme Bots Inc" });
    expect(result.success).toBe(true);
  });
});
