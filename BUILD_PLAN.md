# Oros Productions — Build Plan

Phased build for [SPEC.md](SPEC.md). Each phase is one stacked PR under ~400 lines
changed, excluding lockfiles and generated types.

## Workflow

Branches are stacked with Graphite — each phase branches off the **previous phase's
branch**, not off `main`:

```bash
gt create -m "feat(scope): description"   # start phase N on top of phase N-1
gt submit --stack                          # push and open/update the whole stack
```

Commits follow Conventional Commits: `feat|fix|refactor|docs|test|chore(scope): description`.
Every PR uses `.github/PULL_REQUEST_TEMPLATE.md`.

Where a phase is marked **(split)**, it ships as two stacked PRs rather than one that
breaks the size limit.

---

### Phase 1 — Scaffold
`chore(setup)` · ~250 lines

Next.js App Router + TypeScript strict + Tailwind v4. ESLint and Prettier. Root
`layout.tsx` with `<html className="dark">` and the three fonts via `next/font`
(Instrument Serif, Instrument Sans, IBM Plex Mono). `tsconfig` excludes `studio/`.
PR template committed here so every later PR uses it.

**Done when:** dev server runs, fonts load, TypeScript and lint pass clean.

---

### Phase 2 — Design tokens
`feat(tokens)` · ~200 lines

Install `@radix-ui/colors`. Import **only** the dark variants (`sand-dark`, `gold-dark`,
`amber-dark`, plus the alpha scales). Declare every semantic alias from DESIGN.md §4 in
global CSS, then map them into Tailwind's `@theme` so components write `bg-surface`, never
`bg-[var(--sand-1)]`. Vitest + RTL configured.

Include a dev-only `/styleguide` route rendering every token as a swatch alongside the type
scale — this is how the palette gets verified against DESIGN.md before any real UI exists.

**Done when:** the styleguide renders all tokens correctly and a smoke test passes.

---

### Phase 3 — Sanity schemas
`feat(cms)` · ~350 lines

`studio/` with its own `package.json`, `sanity.config.ts`, `sanity.cli.ts`. All five
schema types from SPEC.md §3. `sanity-plugin-mux-input` wired. Structure Builder pins
`siteSettings` as a singleton. Deployed with `sanity deploy`; friend invited as Editor.

**Done when:** Studio is live at its `.sanity.studio` URL, a test photo and a test film
(with a real Mux upload) both publish successfully.

---

### Phase 4 — Sanity client and queries
`feat(cms)` · ~200 lines

`lib/sanity/client.ts`, `image.ts` (`urlFor` helper), `queries.ts` (typed GROQ), and
content types. Queries select `metadata.dimensions` and `metadata.lqip` — the justified
grid depends on both. Env vars documented in `.env.example`.

**Done when:** a temporary server page renders real content fetched from Sanity.

---

### Phase 5 — UI primitives
`feat(ui)` · ~300 lines

The ridgeline mark as SVG (logo and favicon). The ridgeline divider with its gold→amber lit
segment. `Container`, `Section`, typography components, `Button`. Unit tests.

**Done when:** primitives render in the styleguide and tests pass.

---

### Phase 6 — Hero
`feat(landing)` · ~250 lines

Hero film loop: muted, looped, autoplaying, `playsInline`, **no controls, not clickable**.
Full height on desktop, stopping short on tablet and phone so the next section peeks up.
The sunrise warm-up on load, once per session. Poster-only fallback under
`prefers-reduced-motion`.

**Done when:** the loop plays silently on desktop and mobile Safari, and reduced motion
shows a still frame.

---

### Phase 7 — Landing sections **(split)**
`feat(landing)` · ~350 lines across two PRs

**7a:** selected work (featured photos and films) + services (four verticals from Sanity).
**7b:** about summary + testimonials + the contact CTA as the summit — warmest surfaces,
the one full-strength amber element.

**Done when:** the landing page renders end to end from Sanity content.

---

### Phase 8 — Photos tab **(split)**
`feat(portfolio)` · ~300 lines across two PRs

**8a:** `/portfolio` layout with tabs, and the justified grid — CSS flexbox with
`flex-grow` from Sanity aspect ratios, one to two per row on mobile.
**8b:** category filters and the lightbox, with capture metadata in mono.

**Done when:** the grid justifies cleanly at every breakpoint with no layout shift, and
filters narrow to each vertical.

---

### Phase 9 — Videos tab **(split)**
`feat(portfolio)` · ~300 lines across two PRs

**9a:** the YouTube-style feed — single column of 16:9 cards on mobile widening to a grid,
with duration badges read from Mux.
**9b:** the intercepting route overlay and `mux-player` styled with amber controls. Focus
trap, Escape to close, back button closes.

**Done when:** clicking a card opens the overlay with the grid behind it, a shared link
loads the standalone page, and playback works on mobile.

---

### Phase 10 — About and Contact **(split)**
`feat(pages)` · ~350 lines across two PRs

**10a:** `/about` — portrait, long-form copy, the mission paragraph.
**10b:** `/contact` — form with Zod validation shared client and server, honeypot,
`/api/contact` Route Handler, Resend delivery, rate limiting. Tests for validation and both
result states.

**Done when:** a submission arrives in the destination inbox with a working reply-to.

---

### Phase 11 — Motion
`feat(motion)` · ~200 lines

Scroll fade-ups, hover states, and the ascent — surfaces warming sand → gold down the page,
peaking at contact. Furniture only; never the ground behind photographs. All of it disabled
under `prefers-reduced-motion`.

**Done when:** the warming reads as intentional at full scroll and vanishes entirely with
reduced motion on.

---

### Phase 12 — SEO and analytics
`feat(seo)` · ~250 lines

Per-route metadata, OG images via `next/og`, `sitemap.xml`, `robots.txt`, LocalBusiness
JSON-LD. Vercel Analytics.

**Done when:** shared links preview correctly and the sitemap lists every route.

---

### Phase 13 — E2E and deploy
`test(e2e)` · ~250 lines

Playwright config and the four specs from SPEC.md §8. Vercel project, env vars, custom
domain, production deploy.

**Done when:** all four specs pass against a preview deploy and the site is live on its
domain.

---

## Sequencing notes

Phases 1–5 are foundation and must land in order. Phase 3 needs a real Sanity project
created first — the only step requiring account setup, worth doing before the stack gets
deep. Phases 8 and 9 are independent of each other, but Graphite stacks them linearly
anyway; if they're worked in parallel, restack rather than branching both off Phase 7.

Phase 3 also depends on content your friend needs to supply — the hero loop, the portrait,
testimonials, and the first batch of photos and films. That's the long pole. Worth
requesting at Phase 1, not Phase 3.
