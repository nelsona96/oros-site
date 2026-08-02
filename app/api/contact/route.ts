import { NextResponse } from "next/server";
import { Resend } from "resend";
import { categoryLabel } from "@/lib/film";
import { contactSchema } from "@/lib/contact-schema";
import { isRateLimited } from "@/lib/rate-limit";

// Resend's shared sandbox sender — swap for a verified domain address once
// Phase 13 sets one up. Sending still works today; it just arrives "via
// resend.dev" until then.
const FROM_ADDRESS = "Oros Productions <onboarding@resend.dev>";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ message: "Too many requests. Wait a minute and try again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Check the form and try again." },
      { status: 400 },
    );
  }

  const { name, email, phone, inquiryType, location, eventDate, budget, message, company } = parsed.data;

  // Honeypot tripped — report success without sending, so a bot gets no
  // signal that it was caught and no reason to adapt.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const toEmail = process.env.CONTACT_TO_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  if (!toEmail || !apiKey) {
    return NextResponse.json({ message: "Contact form isn't configured yet." }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    replyTo: email,
    subject: `New inquiry: ${categoryLabel(inquiryType)} — ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      `Inquiry type: ${categoryLabel(inquiryType)}`,
      location ? `Location: ${location}` : null,
      eventDate ? `Event date: ${eventDate}` : null,
      budget ? `Budget: ${budget}` : null,
      "",
      message,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  });

  if (error) {
    return NextResponse.json({ message: "That didn't send. Try again in a moment." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
