/**
 * Populates the Sanity dataset with placeholder content so Phases 6–9 aren't
 * blocked waiting on real assets from the client. See docs/BUILD_PLAN.md
 * Phase 3b.
 *
 * Photos are generic stock images fetched from Picsum at run time — not
 * curated by theme, just real varied photography to exercise the justified
 * grid honestly. The hero loop is a trimmed, compressed CC0 clip committed
 * under scripts/seed-assets/. None of this is meant to survive contact with
 * real content.
 *
 * Usage: npx tsx scripts/seed.ts
 * Requires SANITY_API_TOKEN (editor role) — see .env.example.
 */
import { config } from "dotenv";
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-08-15",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

type PlaceholderPhoto = {
  picsumId: number;
  width: number;
  height: number;
  category: string;
  featured?: boolean;
  order: number;
};

const PHOTOS: PlaceholderPhoto[] = [
  { picsumId: 1015, width: 1200, height: 1600, category: "weddings", featured: true, order: 1 },
  { picsumId: 1016, width: 1600, height: 1067, category: "weddings", order: 2 },
  { picsumId: 1018, width: 1600, height: 1067, category: "commercial", featured: true, order: 3 },
  { picsumId: 1025, width: 1200, height: 1600, category: "commercial", order: 4 },
  { picsumId: 1035, width: 1200, height: 1600, category: "portrait", featured: true, order: 5 },
  { picsumId: 1040, width: 1200, height: 1500, category: "portrait", order: 6 },
  { picsumId: 1043, width: 1600, height: 1067, category: "ministry", featured: true, order: 7 },
  { picsumId: 1050, width: 1600, height: 1067, category: "ministry", order: 8 },
];

const TESTIMONIALS = [
  {
    slug: "placeholder-1",
    quote: "Placeholder quote — replace with a real client testimonial.",
    attribution: "Placeholder client",
    role: "Wedding client",
    category: "weddings",
    order: 1,
  },
  {
    slug: "placeholder-2",
    quote: "Placeholder quote — replace with a real client testimonial.",
    attribution: "Placeholder client",
    role: "Marketing lead",
    category: "commercial",
    order: 2,
  },
  {
    slug: "placeholder-3",
    quote: "Placeholder quote — replace with a real client testimonial.",
    attribution: "Placeholder client",
    role: "Worship pastor",
    category: "ministry",
    order: 3,
  },
];

// Real copy from docs/DESIGN.md §1 — these aren't placeholders, the four
// verticals are permanent site content.
const SERVICES = [
  {
    slugValue: "weddings",
    title: "Weddings & Events",
    blurb: "Couples, families, celebrations.",
    order: 1,
  },
  {
    slugValue: "commercial",
    title: "Commercial & Brand",
    blurb: "Product, interiors, campaign work.",
    order: 2,
  },
  {
    slugValue: "portrait",
    title: "Portrait & Editorial",
    blurb: "Headshots, musicians, personal branding.",
    order: 3,
  },
  {
    slugValue: "ministry",
    title: "Ministry",
    blurb: "Worship services, worship music, testimony films.",
    order: 4,
  },
];

async function uploadPicsumImage(photo: PlaceholderPhoto) {
  const url = `https://picsum.photos/id/${photo.picsumId}/${photo.width}/${photo.height}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Picsum image ${photo.picsumId}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return client.assets.upload("image", buffer, { filename: `placeholder-${photo.picsumId}.jpg` });
}

async function seedPhotos() {
  for (const photo of PHOTOS) {
    const asset = await uploadPicsumImage(photo);
    await client.createOrReplace({
      _id: `seed-photo-${photo.picsumId}`,
      _type: "photo",
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: "Placeholder photo — replace with real photography",
      },
      category: photo.category,
      featured: photo.featured ?? false,
      order: photo.order,
    });
    console.log(`  photo ${photo.picsumId} (${photo.category})`);
  }
}

async function seedTestimonials() {
  for (const t of TESTIMONIALS) {
    await client.createOrReplace({
      _id: `seed-testimonial-${t.slug}`,
      _type: "testimonial",
      quote: t.quote,
      attribution: t.attribution,
      role: t.role,
      category: t.category,
      order: t.order,
    });
    console.log(`  testimonial ${t.slug}`);
  }
}

async function seedServices() {
  for (const s of SERVICES) {
    await client.createOrReplace({
      _id: `service-${s.slugValue}`,
      _type: "service",
      title: s.title,
      slug: { _type: "slug", current: s.slugValue },
      blurb: s.blurb,
      order: s.order,
    });
    console.log(`  service ${s.slugValue}`);
  }
}

async function seedSiteSettings() {
  const assetsDir = path.join(__dirname, "seed-assets");

  const heroVideoAsset = await client.assets.upload(
    "file",
    fs.createReadStream(path.join(assetsDir, "hero-placeholder.mp4")),
    { filename: "hero-placeholder.mp4", contentType: "video/mp4" },
  );
  const heroPosterAsset = await client.assets.upload(
    "image",
    fs.createReadStream(path.join(assetsDir, "hero-poster.jpg")),
    { filename: "hero-poster.jpg" },
  );

  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    name: "Oros Productions",
    tagline: "Scaling new heights in cinematic storytelling.",
    heroVideo: { _type: "file", asset: { _type: "reference", _ref: heroVideoAsset._id } },
    heroPoster: { _type: "image", asset: { _type: "reference", _ref: heroPosterAsset._id } },
    aboutHeading: "Placeholder heading — replace with the real about copy",
    aboutBody: "Placeholder body copy — replace with the real about copy.",
  });
  console.log("  siteSettings (hero loop + poster)");
}

async function main() {
  console.log("Seeding placeholder content...");
  console.log("Photos:");
  await seedPhotos();
  console.log("Testimonials:");
  await seedTestimonials();
  console.log("Services:");
  await seedServices();
  console.log("Site settings:");
  await seedSiteSettings();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
