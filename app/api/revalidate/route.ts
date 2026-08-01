import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

/**
 * Tags mirror the GROQ query tags in lib/sanity/queries.ts, so publishing a
 * photo doesn't invalidate the films feed. See docs/SPEC.md §7.
 */
const KNOWN_TAGS = ["photo", "film", "testimonial", "service", "siteSettings"];

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Missing SANITY_REVALIDATE_SECRET" }, { status: 500 });
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();

  if (!signature || !(await isValidSignature(body, signature, secret))) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as { _type?: string };
  if (!payload._type || !KNOWN_TAGS.includes(payload._type)) {
    return NextResponse.json({ message: `Unknown or missing _type: ${payload._type}` }, { status: 400 });
  }

  // Immediate expiration, not stale-while-revalidate — publishing should be
  // visible on next refresh, matching docs/SPEC.md §7's "live within seconds".
  revalidateTag(payload._type, { expire: 0 });

  return NextResponse.json({ revalidated: true, tag: payload._type, now: Date.now() });
}
