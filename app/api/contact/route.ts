import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildAutoReply, buildInquiryNotification } from "@/lib/contact-email";
import { contactSchema } from "@/lib/contact-schema";
import { isRateLimited } from "@/lib/rate-limit";

// Resend's shared sandbox sender — swap for a verified domain address once
// one exists (no domain registered yet as of Phase 14c; likely lines up with
// Phase 15's domain purchase). Sending still works today; it just arrives
// "via resend.dev" until then.
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

  // Honeypot tripped — report success without sending, so a bot gets no
  // signal that it was caught and no reason to adapt.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const toEmail = process.env.CONTACT_TO_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  if (!toEmail || !apiKey) {
    return NextResponse.json({ message: "Contact form isn't configured yet." }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const notification = buildInquiryNotification(parsed.data);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    replyTo: parsed.data.email,
    subject: notification.subject,
    html: notification.html,
    text: notification.text,
  });

  if (error) {
    return NextResponse.json({ message: "That didn't send. Try again in a moment." }, { status: 502 });
  }

  // The auto-reply confirms receipt to the submitter — a nice-to-have on
  // top of the notification your friend actually triages from. Its failure
  // shouldn't turn an otherwise-successful inquiry into an error for the
  // person who just submitted it; log it and move on instead.
  const autoReply = buildAutoReply(parsed.data);
  const { error: autoReplyError } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: parsed.data.email,
    replyTo: toEmail,
    subject: autoReply.subject,
    html: autoReply.html,
    text: autoReply.text,
  });
  if (autoReplyError) {
    console.error("Contact auto-reply failed to send", autoReplyError);
  }

  return NextResponse.json({ ok: true });
}
