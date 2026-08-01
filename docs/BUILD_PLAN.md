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

### Phase 1 — Scaffold + CI
`chore(setup)` · ~280 lines

Next.js App Router + TypeScript strict + Tailwind v4. ESLint and Prettier. Root
`layout.tsx` with `<html className="dark">` and the three fonts via `next/font`
(Instrument Serif, Instrument Sans, IBM Plex Mono). `tsconfig` excludes `studio/`.
PR template committed here so every later PR uses it. `.github/workflows/ci.yml` runs
lint, typecheck, and unit tests on every PR — the testing checklist in the PR template
means something once CI enforces it.

**Done when:** dev server runs, fonts load, TypeScript and lint pass clean, CI is green.

---

### Phase 2 — Design tokens **(split)**
`feat(tokens)` · ~350 lines across two PRs

**2a:** Install `@radix-ui/colors`. Import **only** the dark variants (`sand-dark`,
`gold-dark`, `amber-dark`, plus the alpha scales). Declare every semantic alias from
DESIGN.md §4 in global CSS, then map them into Tailwind's `@theme` so components write
`bg-surface`, never `bg-[var(--sand-1)]`. Vitest + RTL configured. A dev-only
`/styleguide` route rendering every token as a swatch alongside the type scale — this is
how the palette gets verified against DESIGN.md before any real UI exists.

**2b:** `shadcn init` with a `base-*` style and `iconLibrary: "lucide"`. The token-bridge
rewrite from SPEC.md §1 so shadcn's generated tokens alias ours. `--radius: 2px` per
DESIGN.md §6. A `lucide` wrapper component fixing stroke to 1.5px and size to 16–20px so
defaults can't drift later.

**Done when:** the styleguide renders all tokens correctly, `npx shadcn add button`
produces a component with zero hardcoded oklch or hex, and a smoke test passes.

---

### Phase 3 — Sanity schemas **(split)**
`feat(cms)` · ~400 lines across two PRs

**3a:** `studio/` with its own `package.json`, `sanity.config.ts`, `sanity.cli.ts`. All
five schema types from SPEC.md §3. `sanity-plugin-mux-input` wired. Structure Builder
pins `siteSettings` as a singleton. Deployed with `sanity deploy`; friend invited as
Editor.

**3b:** `scripts/seed.ts` populating placeholder photos, a stand-in hero loop, and dummy
testimonials via licensed placeholder assets. This unblocks phases 6–9 from waiting on
the friend's real content — the schedule risk noted below.

**Done when:** Studio is live at its `.sanity.studio` URL, a test photo and a test film
(with a real Mux upload) both publish successfully, and the seed script populates a
usable placeholder dataset end to end.

---

### Phase 4 — Sanity client, queries, and revalidation
`feat(cms)` · ~280 lines

`lib/sanity/client.ts`, `image.ts` (`urlFor` helper), `queries.ts` (typed GROQ, tagged by
document type), and content types. Queries select `metadata.dimensions` and
`metadata.lqip` — the justified grid depends on both. `/api/revalidate` verifying the
Sanity webhook signature and calling `revalidateTag` per SPEC.md §7. Env vars documented
in `.env.example`.

**Done when:** a temporary server page renders real content fetched from Sanity, and
publishing a test edit in Studio reflects on that page within seconds via the webhook.

---

### Phase 5 — UI primitives, header, and footer
`feat(ui)` · ~350 lines

The ridgeline mark as SVG (logo and favicon). The ridgeline divider with its gold→amber
lit segment. `Container`, `Section`, typography components. `Button` wraps shadcn's
rather than being hand-built. The header — three inline links (Work / About / Contact) in
mono caps, transparent over the hero, gaining `--surface` on scroll per DESIGN.md §6 —
and a minimal footer. Unit tests.

**Done when:** primitives render in the styleguide, the header transitions correctly on
scroll, and tests pass.

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
**8b:** category filters as text links (not icons — see DESIGN.md §6) and the lightbox
(shadcn `Dialog`), with capture metadata in mono.

**Done when:** the grid justifies cleanly at every breakpoint with no layout shift, and
filters narrow to each vertical.

---

### Phase 9 — Videos tab **(split)**
`feat(portfolio)` · ~300 lines across two PRs

**9a:** the YouTube-style feed — single column of 16:9 cards on mobile widening to a grid,
with duration badges read from Mux.
**9b:** the intercepting route overlay built on shadcn `Dialog` (focus trap and Escape
handling come from it) with `mux-player` styled to amber controls. Back button closes.

**Done when:** clicking a card opens the overlay with the grid behind it, a shared link
loads the standalone page, and playback works on mobile.

---

### Phase 10 — About and Contact **(split)**
`feat(pages)` · ~350 lines across two PRs

**10a:** `/about` — portrait, long-form copy, the mission paragraph.
**10b:** `/contact` — shadcn `Form` + `react-hook-form` + Zod resolver, honeypot,
`/api/contact` Route Handler, Resend delivery, rate limiting, `Sonner` toast on result.
Tests for validation and both result states.

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

### Phase 12 — SEO, analytics, and system pages
`feat(seo)` · ~300 lines

Per-route metadata, OG images via `next/og`, `sitemap.xml`, `robots.txt`, LocalBusiness
JSON-LD. Vercel Analytics. `not-found.tsx`, `error.tsx`, `loading.tsx`, and empty states
for filtered views with no results (per SPEC.md §4).

**Done when:** shared links preview correctly, the sitemap lists every route, and each
system page renders with real copy.

---

### Phase 13 — E2E and deploy
`test(e2e)` · ~250 lines

Playwright config and the four specs from SPEC.md §8. Vercel project, env vars, custom
domain, production deploy.

**Done when:** all four specs pass against a preview deploy and the site is live on its
domain.

---

## Sequencing notes

Phases 1–5 are foundation and must land in order. Phase 3a needs a real Sanity project
created first — the only step requiring account setup, worth doing before the stack gets
deep. Phases 8 and 9 are independent of each other, but Graphite stacks them linearly
anyway; if they're worked in parallel, restack rather than branching both off Phase 7.

Phase 3b (seeded placeholder content) unblocks phases 6–9 from waiting on real assets —
the friend's hero loop, portrait, testimonials, and first batch of photos and films can
now arrive in parallel with the build rather than gating it. Still worth requesting that
content at Phase 1, since the seeded placeholders get swapped for real content before
launch either way.
