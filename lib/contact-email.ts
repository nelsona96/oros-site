import { categoryLabel } from "./film";
import type { ContactFormValues } from "./contact-schema";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: string): string {
  return value.replace(/\n/g, "<br>");
}

/** Digits and a leading + only — what a `tel:` href needs, regardless of how the phone number was typed in. */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * A full document, not a bare fragment — Resend hands `html` to the
 * recipient's email client as-is, and clients (Outlook desktop especially)
 * behave far less predictably without a real `<!doctype>`/`<head>`. The
 * explicit `charset="utf-8"` matters concretely here: without it, the em
 * dashes and en dashes already in this copy (subject lines, budget ranges)
 * render as mojibake in clients that don't correctly infer the encoding.
 * The explicit white background is equally deliberate — plain light text on
 * no declared background is exactly what an email client's automatic
 * dark-mode inversion tends to mangle; declaring both colors keeps it
 * predictable everywhere, rather than porting DESIGN.md's dark theme (which
 * email dark-mode support is too inconsistent to render reliably anyway).
 */
function emailShell(bodyHtml: string, title: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin: 0; padding: 24px; background-color: #f5f5f4;">
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a1a1a; background-color: #ffffff; max-width: 560px; margin: 0 auto; padding: 24px;">
      ${bodyHtml}
    </div>
  </body>
</html>`;
}

function fieldRowsHtml(rows: Array<[string, string]>): string {
  return `<table style="width: 100%; border-collapse: collapse;">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding: 4px 12px 4px 0; color: #6b6b6b; font-size: 13px; white-space: nowrap; vertical-align: top;">${escapeHtml(label)}</td><td style="padding: 4px 0; font-size: 14px;">${value}</td></tr>`,
    )
    .join("")}</table>`;
}

/**
 * The email that actually matters — what your friend triages a lead from.
 * Triage fields (type, date, location, budget) lead so the shape of the
 * inquiry is scannable before the message; contact info (with tappable
 * `tel:`/`mailto:` links) trails last, since it's what gets used once he's
 * decided to follow up.
 */
export function buildInquiryNotification(values: ContactFormValues): EmailContent {
  const { name, email, phone, inquiryType, location, eventDate, budget, message } = values;
  const typeLabel = categoryLabel(inquiryType);

  const triageRows: Array<[string, string]> = [["Type", escapeHtml(typeLabel)]];
  if (eventDate) triageRows.push(["Date", escapeHtml(eventDate)]);
  if (location) triageRows.push(["Location", escapeHtml(location)]);
  if (budget) triageRows.push(["Budget", escapeHtml(budget)]);

  const contactRows: Array<[string, string]> = [
    ["From", escapeHtml(name)],
    ["Email", `<a href="mailto:${escapeHtml(email)}" style="color: #a86b2d;">${escapeHtml(email)}</a>`],
  ];
  if (phone) contactRows.push(["Phone", `<a href="${telHref(phone)}" style="color: #a86b2d;">${escapeHtml(phone)}</a>`]);

  const subject = `New inquiry: ${typeLabel} — ${name}`;

  const html = emailShell(
    `
    <h1 style="font-size: 18px; margin: 0 0 16px;">New inquiry — ${escapeHtml(typeLabel)}</h1>
    ${fieldRowsHtml(triageRows)}
    <p style="font-size: 14px; line-height: 1.6; margin: 20px 0; border-top: 1px solid #e5e5e5; padding-top: 16px;">${nl2br(escapeHtml(message))}</p>
    <div style="border-top: 1px solid #e5e5e5; padding-top: 16px;">${fieldRowsHtml(contactRows)}</div>
  `,
    subject,
  );

  const text = [
    `Type: ${typeLabel}`,
    eventDate ? `Date: ${eventDate}` : null,
    location ? `Location: ${location}` : null,
    budget ? `Budget: ${budget}` : null,
    "",
    message,
    "",
    `From: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return { subject, html, text };
}

/** Confirms receipt to the person who submitted the form — not a substitute for a real reply, just a "this arrived" signal. */
export function buildAutoReply(values: ContactFormValues): EmailContent {
  const { name, inquiryType, message } = values;
  const typeLabel = categoryLabel(inquiryType);
  const firstName = name.trim().split(/\s+/)[0] ?? name;

  const subject = "We got your message — Oros Productions";

  const html = emailShell(
    `
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">Hi ${escapeHtml(firstName)},</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
      Thanks for reaching out to Oros Productions about your ${escapeHtml(typeLabel.toLowerCase())} inquiry.
      We've got your message and will be in touch soon.
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #6b6b6b; margin: 0 0 4px;">What you sent us:</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px; border-left: 2px solid #e5e5e5; padding-left: 12px;">${nl2br(escapeHtml(message))}</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0;">— Oros Productions</p>
  `,
    subject,
  );

  const text = [
    `Hi ${firstName},`,
    "",
    `Thanks for reaching out to Oros Productions about your ${typeLabel.toLowerCase()} inquiry. We've got your message and will be in touch soon.`,
    "",
    "What you sent us:",
    message,
    "",
    "— Oros Productions",
  ].join("\n");

  return { subject, html, text };
}
