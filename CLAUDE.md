@AGENTS.md

# Established patterns (Phases 1-5)

Reference for matching existing conventions. Full rationale lives in
`docs/DESIGN.md` / `docs/SPEC.md` / `docs/BUILD_PLAN.md` — this is "how it's
already wired," not "why."

## Color tokens

Three-layer chain, always in this order. Never skip a layer.

1. **Radix scale step** (`--sand-1`, `--gold-9`, `--amber-11`, `--tomato-9`) —
   imported dark-only in `app/globals.css`. Never referenced outside that file.
2. **Semantic alias** (`--app-bg`, `--text-primary`, `--accent-solid`, ...) —
   declared once in `app/globals.css`'s `:root` block, each pointing at one
   Radix step. Add new tokens here, mapped to the correct DESIGN.md §4 step
   range (1-2 bg, 3-5 component, 6-8 border, 9-10 solid, 11-12 text).
3. **Tailwind theme key** (`--color-app-bg`, `--color-text-primary`, ...) —
   declared in the `@theme inline` block, each pointing at the alias from
   step 2. This is what generates the utility class.

Result: `bg-app-bg`, `text-text-primary`, `border-border`, `ring-focus-ring`.

**Naming gotcha — do not reuse shadcn's vocabulary.** shadcn/Base UI owns
`primary`, `secondary`, `accent`, `muted`, `background`, `foreground`, `card`,
`border`, `ring`, `input`, `destructive` for its own component semantics
(bridged separately, see below). Our own text-tone tokens are prefixed
`text-*` specifically to avoid colliding with that vocabulary — e.g. the
Tailwind key is `--color-text-primary` (utility: `text-text-primary`), not
`--color-primary`. This collision already happened once in Phase 2b: shadcn's
init silently detected `--color-primary` already existed and skipped
generating its own mapping, so `bg-primary` was quietly wrong until caught.
Do not add a bare `primary`/`secondary`/`accent`/`muted` Tailwind key for
anything that isn't the actual shadcn bridge.

**shadcn bridge**: shadcn's own generated variables (`--background`,
`--primary`, `--radius`, etc.) are separately aliased to our semantic layer
right below it in the same `:root` block, then mapped into `@theme inline`
under their own shadcn-native names. This is what makes `npx shadcn add`
keep working — new components inherit Sand/Gold/Amber automatically with zero
extra wiring. If a new shadcn variable shows up after `shadcn add`, bridge it
here the same way rather than leaving its generated oklch value in place.

**No arbitrary hex, no exceptions found so far** — including for icons/logos
(`components/ridgeline-mark.tsx` uses `currentColor`, not a literal). The one
unavoidable exception is `app/icon.svg` (favicons render outside any page CSS
context), which hardcodes the exact hex of a real token with a comment
tracing it back (`gold-9`).

## Components

- `components/*.tsx` — our own primitives, one per file, **named exports**
  (never default), kebab-case filenames matching the export
  (`ridgeline-mark.tsx` → `RidgelineMark`).
- `components/ui/` — shadcn-generated output only. Don't hand-edit unless
  regenerating; treat as vendored.
- Server Components by default. `"use client"` only where actually needed
  (state, effects, browser APIs) — e.g. `header.tsx` for its scroll listener.
  Everything else (`container.tsx`, `section.tsx`, `typography.tsx`,
  `ridgeline.tsx`, `ridgeline-mark.tsx`, `footer.tsx`) is a plain Server
  Component.
- Icons: always through `components/icon.tsx`'s `<Icon icon={X} />` wrapper
  (fixes stroke/size per DESIGN.md §6). Never import a `lucide-react` icon
  directly into a component.
- Class merging: `cn()` from `lib/utils.ts` (clsx + tailwind-merge), already
  used by shadcn's own components — reuse it rather than manual template
  literals when a component needs conditional classes.
- New dev-only reference routes (like `/styleguide`) gate with:
  ```ts
  if (process.env.NODE_ENV !== "development") notFound();
  ```
  Exception: temporary verification pages that specifically need to be
  reachable in a production build (see `/sanity-check`, deleted once Phase
  6-7 land) skip this gate — note why in a comment if you do this.

## Sanity data layer (`lib/sanity/`)

- `client.ts` — the one `createClient()` instance, `useCdn: false` always
  (Next's Data Cache + `revalidateTag` is the source of truth, not Sanity's
  own CDN TTL — see SPEC.md §7).
- `image.ts` — `urlFor()` via the **named** `createImageUrlBuilder` export
  (the default export is deprecated and warns at build time).
- `types.ts` — hand-written interfaces mirroring `studio/schemaTypes/`.
  Every image field is a structured `SanityImage` (asset ref + `metadata.
  {dimensions, lqip}`), never a flattened URL string — components call
  `urlFor()` themselves at whatever size their layout needs.
- `queries.ts` — one function per query, each `client.fetch<T>()` call tagged
  with `next: { tags: ["photo" | "film" | "testimonial" | "service" |
  "siteSettings"] }`, matching the tag names `/api/revalidate` invalidates
  1:1. New document type → new tag → add it to `KNOWN_TAGS` in
  `app/api/revalidate/route.ts` too.
- Query result caching is only observable in a **production build**
  (`next build && next start`) — `next dev` doesn't cache fetches the same
  way, so don't try to verify revalidation behavior against the dev server.

## Testing

- Vitest + React Testing Library, jsdom environment. Config: `vitest.config.ts`
  / `vitest.setup.ts`.
- `vitest.setup.ts` registers `afterEach(cleanup)` explicitly (not
  `test.globals: true` — keeps the project's explicit-import style). This is
  load-bearing: without it, `render()` calls leak between tests in the same
  file. Don't remove it, don't add a second cleanup mechanism.
- Test files are colocated (`header.tsx` + `header.test.tsx` in the same
  folder), not in a separate `__tests__/` tree.
- Mock `next/navigation` / `next/cache` per-test with `vi.mock(...)` when a
  component or route needs them (see `header.test.tsx`, `route.test.ts`) —
  don't add global mocks to the setup file for framework internals.
- Test real logic, not pass-through wrappers. `Container`/`Section` have no
  dedicated test files (nothing to assert); `Ridgeline`'s gradient math and
  `Header`'s scroll/active-state behavior do.

## Env vars & secrets

- `.env.local` — real values, gitignored, never committed.
- `.env.example` — documents every var with a blank or non-secret value.
  `.gitignore` has an explicit `!.env.example` exception carved out of the
  blanket `.env*` ignore — don't remove it.
- Scripts that need Sanity write access (`scripts/seed.ts`) load
  `.env.local` explicitly via `dotenv`'s `config({ path: ... })`, not the
  bare `dotenv/config` import (which only auto-loads `.env`, not `.env.local`).

## Tooling

- Node version pinned in `.nvmrc` (currently 24.18.0) — `nvm use` before any
  `npm` command if your shell doesn't auto-load it.
- `studio/` is a fully separate package (own `package.json`, own ESLint
  config) — excluded from the root `tsconfig.json` and root
  `eslint.config.mjs`. Don't add Studio source files to root's lint/type
  scope, and don't add root dependencies to `studio/package.json`.
- Branching/PRs: Graphite stacks, ~400-line soft budget per PR (split into
  sub-phases like `5a`/`5b` when a phase would blow past it — see
  `docs/BUILD_PLAN.md`'s already-split phases for the pattern). PR
  descriptions are written and filled in via `gh pr edit`, never left blank.

---

# Established patterns (Phases 6-8)

Same framing as above: how it's wired, not why. Phases 6-8 built the landing
page (hero, selected work, services, about summary, testimonials, contact
CTA) and the portfolio Photos tab (justified grid, category filters,
lightbox).

## Page composition & data fetching

- Landing/portfolio pages (`app/page.tsx`, `app/portfolio/photos/page.tsx`)
  are `async` Server Components that `Promise.all([...])` every Sanity query
  the page needs in parallel, then pass the resolved data down as props to
  presentational/client components. Never fetch inside a client component.
- Components whose content comes from optional Sanity data (`SelectedWork`,
  `Services`, `Testimonials`, `AboutSummary`, the Instagram link in
  `ContactCta`) **self-guard**: they return `null` when their required data
  is empty/missing. The page composing them doesn't check first.
- Prefer **client-side filtering over an already-fetched list** to a
  `category`/similar search param + Server Component refetch, whenever the
  interaction should feel instant rather than deep-linkable. A search param
  forces the whole page to dynamically re-render server-side on every tap,
  which reads as a page reload, not a filter flipping — this is why
  `CategoryFilter`/`PhotoGallery` fetch every photo once and filter
  client-side instead of re-querying Sanity per category. Trade-off:
  filtered views aren't shareable URLs. Worth it only when instant feedback
  matters more than that.
- Section headers pair `<Eyebrow>` (small label) with `<Display as="h2">`
  (the actual heading) — see any of the Phase 7 landing sections. Section
  backgrounds alternate `bg-app-bg` (default) / `bg-app-bg-subtle` (banded)
  down the page, warming to `bg-surface` only at the Contact CTA (the
  "warmest" surface, per DESIGN.md §3's ascent). `<Ridgeline position={n} />`
  dividers sit between major sections with varied `position` values so
  repeated dividers don't look mechanically identical.

## next/image & preloading

- Standard image src: `urlFor(image).width(w).quality(q).url()` passed as
  `src`. For content that should progressively blur-up on its own first
  paint (grid thumbnails, portraits), use `placeholder="blur"
  blurDataURL={image.asset.metadata.lqip}`.
- **Don't use `placeholder="blur"` for an image that gets swapped/revisited
  in the same session** (e.g. a lightbox) — replaying the blur-up on every
  switch reads as a flicker, not progressive loading. Use a spinner +
  opacity fade-in instead, and see the remounting gotcha below.
- Use the `preload` prop, not the deprecated `priority` prop, on
  `next/image` in this Next version (`priority` still works but warns).
- `getImageProps` (from `next/image`) computes the same `src`/`srcSet`
  next/image would use, without mounting a component — use it to build
  `<link rel="preload" as="image" imageSrcSet={...} imageSizes={...}>` hints
  that warm the browser cache ahead of when the real `<Image>` mounts (see
  `components/photo-gallery.tsx`'s `LightboxPreloadLinks`). React 19 hoists
  `<link>`/`<meta>` rendered anywhere in the component tree into `<head>`
  automatically — no `next/head` needed.
- **Never `key`-remount an `<Image>` (or a component wrapping one) that the
  user might navigate back to.** This looks like it should follow the
  "reset state via `key`" pattern below (Testing gotchas) — it's the one
  exception. A `key` change unmounts and remounts, resetting all local
  state (including "have I loaded before") even when the browser has the
  bytes cached — the visual result is a spinner flash on every revisit,
  which reads as "it reloaded" even though nothing was refetched. Prefer
  stacking every candidate as its own persistent, never-remounted layer and
  toggling visibility (see `components/photo-gallery.tsx`'s
  `LightboxPhotoLayer`): each layer's `loaded` state is set once and never
  reset, so a photo shows its spinner at most once per session.

## shadcn / Base UI gotchas

- `components/ui/*` stays vendored — override styling via `className` at
  the call site (tailwind-merge cancels conflicting default utilities).
  When overriding a positioning/sizing utility, override **every**
  conflicting default explicitly rather than assuming one override is
  enough — e.g. cancelling a default `w-full` needs an explicit `w-auto` in
  your override, not just a `max-w-none`. An unresolved mix of your
  override and a leftover default is a real, easy-to-miss layout bug (see
  `components/photo-gallery.tsx`'s `DialogContent` className), not just
  visual noise.
- A Base UI component composed onto a non-native element via the `render`
  prop (e.g. shadcn's `Button` rendered as a `next/link` `Link`) needs
  `nativeButton={false}` explicitly, or Base UI both warns and drops real
  button semantics. With it set, the resulting element correctly exposes
  `role="button"` (its visual affordance) while keeping real `<a href>`
  navigation — query it by that role in tests, not `"link"`.
- `npx shadcn add <name>` skips re-writing files that would be identical
  (e.g. adding `dialog.tsx`, which depends on `button.tsx`, won't clobber
  an existing `button.tsx`) — safe to run again for a new component.
- `lucide-react` in this installed version has **no brand/logo icons**
  (`Instagram` etc. were removed upstream) despite DESIGN.md §6 listing
  Instagram as allowed. Use a semantically-equivalent icon instead (we used
  `ExternalLink` for an outbound social link) rather than adding a second
  icon library for one glyph.

## CSS gotchas

- **`ring-inset` can be invisible, not just low-contrast.** An inset
  box-shadow paints in the same step as an element's own background —
  *before* its children paint. A full-bleed child (e.g. a photo filling a
  button) will completely cover it, even though it's present in devtools.
  Use a normal (outset) ring on any interactive element with a full-bleed
  child (see `components/justified-grid.tsx`).
- The justified photo grid (`components/justified-grid.tsx`) is pure CSS:
  `flex-wrap` + `flex-grow`/`flex-basis` proportional to each image's real
  aspect ratio, with a `--row-h` CSS custom property (responsive per
  breakpoint) driving the `calc()` math. Trailing zero-height filler
  elements (`flex-grow: 999`) fix the classic "short last row stretches to
  fill the line" problem — the standard CSS-only workaround for this
  technique.
- `touch-manipulation` on custom interactive elements (real `<button>`s,
  not `<Link>`s) is cheap, standard practice for mobile — but see the
  testing note below before assuming it fixes a reported mobile bug.

## Testing & mobile-debugging gotchas

- `element.click()` / `fireEvent.click(node)` on a specific DOM node
  bypasses real hit-testing — it cannot catch "something else is actually
  on top of this element." When a covering-element bug is suspected, use
  `document.elementFromPoint(x, y)` instead, which respects real stacking.
- **A "works on desktop, broken on mobile" interactivity report may be a
  dev-server artifact, not a code bug.** `next dev`'s unminified Turbopack
  bundle and HMR client are slow/fragile on mobile CPUs and some networks —
  native `<Link>`s (real `<a href>`, work without JS) can appear fine while
  every custom `onClick` handler is silently dead because hydration never
  finished. Before spending more time on a mobile-only bug, ask whether it
  was tested against `next dev` or a production build (`npm run build &&
  npm run start`) — this exact investigation (Phase 8b) turned out to be
  dev-server-only, not a bug in the component code at all.
- `next/image`'s `onLoad` is deferred behind an internal `img.decode()`
  promise — `fireEvent.load(img)` won't synchronously flip state in a test;
  wrap the assertion in `waitFor(...)`.
- "Reset state when a prop changes" is a `key`-remount job, not a
  `useEffect` — `setState` called unconditionally in an effect body trips
  the `react-hooks/set-state-in-effect` lint rule. Seen more than once in
  this build: extract the piece that needs to reset into its own component
  and give it `key={theChangingValue}` instead.
