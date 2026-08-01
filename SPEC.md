# Oros Productions — Technical Spec

Pass 2: technical scope. Creative direction lives in [DESIGN.md](DESIGN.md); this
document does not restate it. Build sequencing lives in [BUILD_PLAN.md](BUILD_PLAN.md).

---

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js, App Router. Server Components by default; `"use client"` only where interactivity requires it. |
| Language | TypeScript, strict |
| Styling | Tailwind v4, CSS-first config via `@theme` |
| Content | Sanity Content Lake, queried with GROQ. **No separate database or ORM.** |
| Images | Sanity asset CDN via `@sanity/image-url` |
| Portfolio video | Mux, uploaded through Studio via `sanity-plugin-mux-input` |
| Hero loop | MP4 file asset in Sanity |
| Player | `@mux/mux-player-react` |
| Email | Resend, from a single Route Handler |
| Testing | Vitest + React Testing Library; Playwright for E2E |
| Hosting | Vercel (Next app) + `sanity deploy` (Studio) |
| Analytics | Vercel Analytics |

### Dependency discipline

The justified photo grid is built with **CSS flexbox** — `flex-grow` proportional to each
image's aspect ratio, which produces justified rows natively with zero JavaScript and no
layout shift, since aspect ratios come from Sanity's asset metadata at request time. A
layout library (`react-photo-album`) is the fallback only if last-row behavior proves
unworkable in practice. Not a default.

---

## 2. Repository layout

Next app at the root so Vercel needs no configuration; Studio in a sibling folder with
its own `package.json`, deployed separately.

```
oros-site/
├── DESIGN.md · SPEC.md · BUILD_PLAN.md
├── .github/PULL_REQUEST_TEMPLATE.md
├── app/
│   ├── layout.tsx                    # <html className="dark">, fonts
│   ├── page.tsx                      # landing
│   ├── portfolio/
│   │   ├── layout.tsx                # tabs
│   │   ├── photos/page.tsx
│   │   └── videos/
│   │       ├── page.tsx
│   │       └── @modal/(.)[slug]/     # intercepting route → player overlay
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   └── api/contact/route.ts
├── components/
├── lib/sanity/{client,image,queries}.ts
├── e2e/                              # Playwright
└── studio/                           # own package.json, excluded from root tsconfig
    ├── sanity.config.ts · sanity.cli.ts
    └── schemaTypes/
```

---

## 3. Content model

Four verticals are a shared list used by `photo`, `film`, and `service`:
`weddings` · `commercial` · `portrait` · `ministry`.

### `photo`
| Field | Type | Notes |
|---|---|---|
| `image` | image (hotspot) | Required |
| `image.alt` | string | **Required** — accessibility floor in DESIGN.md §10 |
| `category` | string (list of 4) | Required; drives the Photos tab filters |
| `caption` | string | Optional |
| `capture` | object | Optional: `camera`, `lens`, `aperture`, `shutter` — renders the mono metadata line from DESIGN.md §5 |
| `featured` | boolean | Surfaces in the landing "selected work" cut |
| `order` | number | Manual ordering |

Queries must select `asset->metadata.dimensions` (for aspect-ratio-driven justified rows)
and `asset->metadata.lqip` (blur placeholder).

### `film`
| Field | Type | Notes |
|---|---|---|
| `title` | string | Required |
| `slug` | slug | Source: title. Drives `/portfolio/videos/[slug]` |
| `category` | string (list of 4) | Required |
| `video` | `mux.video` | Required |
| `thumbnail` | image (hotspot) | Optional hand-picked frame; falls back to Mux's generated poster |
| `description` | text | Optional |
| `client` | string | Optional |
| `date` | date | |
| `featured` | boolean | |
| `order` | number | |

Duration for the grid badge comes from Mux (`video.asset.data.duration`) — never entered
by hand.

### `testimonial`
`quote` (text, required) · `attribution` (string, required) · `role` (string) ·
`category` (optional) · `order` (number)

### `service`
`title` · `slug` · `blurb` (text) · `order` · `coverImage` (optional)

Four documents, one per vertical. A document type rather than an array in settings, so
the deferred `/services/[slug]` pages need no migration.

### `siteSettings` (singleton)
Studio name · tagline · `heroVideo` (file) · `heroPoster` (image) · about heading and
body · portrait · contact email, phone, Instagram · default OG image and meta description.

Pinned as a singleton via the Structure Builder so there's exactly one, and your friend
can't accidentally create a second.

---

## 4. Routes

| Route | Rendering | Content |
|---|---|---|
| `/` | Server Component | Hero loop → selected work → services → about summary → testimonials → contact CTA |
| `/portfolio/photos` | Server Component | Justified grid, category filters, lightbox |
| `/portfolio/videos` | Server Component | YouTube-style feed of `film` cards |
| `/portfolio/videos/[slug]` | Intercepted | Player overlay over the grid; direct visits render a standalone page |
| `/about` | Server Component | Portrait, long-form about, the faith/mission paragraph |
| `/contact` | Client form in a Server page | Form → `/api/contact` |
| `/api/contact` | Route Handler | Validates, honeypot check, sends via Resend |

Portfolio tabs are **real routes**, not `?tab=` — shareable, indexable, and each page runs
its own GROQ query server-side rather than one client component holding both datasets.

The video overlay uses an **intercepting route** so it has a real URL, the back button
closes it, and the grid stays mounted behind — which is what DESIGN.md §8 describes.
Direct navigation and refresh land on a full page, so shared links work.

---

## 5. Contact form

Fields: name, email, inquiry type (the four verticals), event date (optional), message.
The inquiry-type field is what lets your friend triage a wedding from a brand shoot at a
glance.

- Validation with Zod, shared between client and Route Handler
- **Honeypot** hidden field — a public form on a photography site attracts bots immediately
- Basic per-IP rate limiting in the handler
- Resend sends a formatted email to `CONTACT_TO_EMAIL`, `replyTo` set to the submitter
- Success and failure states written per DESIGN.md's copy guidance: errors say what
  happened and what to do, and never apologize

---

## 6. Environment variables

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Next | Public |
| `NEXT_PUBLIC_SANITY_DATASET` | Next | `production` |
| `NEXT_PUBLIC_SITE_URL` | Next | Canonical URLs, OG images, sitemap |
| `RESEND_API_KEY` | Next, server only | |
| `CONTACT_TO_EMAIL` | Next, server only | |

Mux credentials live in the Studio's plugin config, entered once in the Studio UI —
**the Next app needs no Mux secret**, since playback IDs on a public policy are safe to
expose. Nothing in the app requires a Sanity write token; the dataset is public-read.

---

## 7. Content editing workflow

Studio deployed with `sanity deploy` to `oros.sanity.studio`. Your friend is invited as
an **Editor** through manage.sanity.io — no code, no local setup, no repo access.

Video uploads happen inside Studio through the Mux plugin, so there is one place to
manage everything. No preview environment: publish, then refresh the site.

---

## 8. Testing

**Vitest + React Testing Library** on reusable pieces:
`JustifiedGrid` (row math, renders every image, alt text present) · `PortfolioTabs`
(active state, correct hrefs) · `CategoryFilter` · `VideoCard` (duration formatting,
thumbnail fallback) · `FilmPlayer` wrapper (playback ID wiring) · `ContactForm`
(validation, honeypot, error and success states).

**Playwright**, deliberately few:
1. Landing page loads, hero renders, primary nav works
2. Portfolio tab toggle switches between photos and videos
3. A video card opens the overlay and playback actually starts
4. Contact form submits successfully with the network call mocked

Meaningful coverage of core interactions, not exhaustive coverage.

---

## 9. Accessibility & performance floor

From DESIGN.md §10, restated as build requirements: alt text enforced at the schema
level; visible keyboard focus using `--focus-ring`; `prefers-reduced-motion` disabling the
sunrise warm-up, scroll fade-ups, and ascent warming, with the hero falling back to its
poster frame; the video overlay traps focus and closes on Escape; captions on ministry and
wedding films.

Images use `next/image` with Sanity's CDN, LQIP placeholders, and explicit dimensions so
the justified grid never shifts. The hero MP4 is compressed hard and lazy-decoded — it is
decoration, not content, and must not block first paint.

---

## 10. Explicitly deferred

Not in the MVP, recorded so they aren't rediscovered as surprises:

- **Per-service pages** (`/services/weddings` etc.) — the strongest post-MVP addition for
  local search; the `service` schema already supports it
- Photo galleries / per-shoot projects — DESIGN.md's flat curated grid is the MVP
- Pricing
- Instagram feed — costs a token that expires and needs manual refreshing
- Draft preview / Presentation tool
- Client delivery galleries, blog, multi-language
