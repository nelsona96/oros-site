import { describe, expect, it } from "vitest";
import type { ContactFormValues } from "./contact-schema";
import { buildAutoReply, buildInquiryNotification } from "./contact-email";

const values: ContactFormValues = {
  name: "Jamie Rivera",
  email: "jamie@example.com",
  phone: "555-0100",
  inquiryType: "weddings",
  location: "Asheville, NC",
  eventDate: "2026-09-12",
  budget: "$5,000–$10,000",
  message: "We're planning a fall wedding.\nWould love to talk about coverage.",
  company: "",
};

describe("buildInquiryNotification", () => {
  it("puts the triage fields (type, date, location, budget) before the message", () => {
    const { html } = buildInquiryNotification(values);
    const typeIndex = html.indexOf("Weddings");
    const budgetIndex = html.indexOf("$5,000");
    const messageIndex = html.indexOf("We&#39;re planning");
    expect(typeIndex).toBeGreaterThan(-1);
    expect(typeIndex).toBeLessThan(budgetIndex);
    expect(budgetIndex).toBeLessThan(messageIndex);
  });

  it("renders a tappable tel: link built from digits only, regardless of formatting", () => {
    const { html } = buildInquiryNotification(values);
    expect(html).toContain('href="tel:5550100"');
  });

  it("renders a tappable mailto: link for the submitter's email", () => {
    const { html } = buildInquiryNotification(values);
    expect(html).toContain('href="mailto:jamie@example.com"');
  });

  it("omits phone, date, location, and budget from both html and text when not provided", () => {
    const minimal: ContactFormValues = { ...values, phone: undefined, eventDate: undefined, location: undefined, budget: undefined };
    const { html, text } = buildInquiryNotification(minimal);
    expect(html).not.toContain("tel:");
    expect(text).not.toContain("Phone:");
    expect(text).not.toContain("Date:");
    expect(text).not.toContain("Location:");
    expect(text).not.toContain("Budget:");
  });

  it("escapes HTML in user-supplied fields rather than injecting it raw", () => {
    const hostile: ContactFormValues = { ...values, name: "<script>alert(1)</script>", message: "<img src=x>" };
    const { html } = buildInquiryNotification(hostile);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes the submitter's name in the subject", () => {
    const { subject } = buildInquiryNotification(values);
    expect(subject).toContain("Jamie Rivera");
    expect(subject).toContain("Weddings");
  });
});

describe("buildAutoReply", () => {
  it("greets the submitter by first name only", () => {
    const { html, text } = buildAutoReply(values);
    expect(html).toContain("Hi Jamie,");
    expect(text).toContain("Hi Jamie,");
  });

  it("includes the message the submitter sent, escaped", () => {
    const hostile: ContactFormValues = { ...values, message: "<b>hi</b>" };
    const { html } = buildAutoReply(hostile);
    expect(html).not.toContain("<b>hi</b>");
    expect(html).toContain("&lt;b&gt;hi&lt;/b&gt;");
  });

  it("has a subject that doesn't read as a triage notification", () => {
    const { subject } = buildAutoReply(values);
    expect(subject.toLowerCase()).not.toContain("new inquiry");
  });
});
