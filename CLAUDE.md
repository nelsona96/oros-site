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
