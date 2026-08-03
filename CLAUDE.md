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
- **Content written via `scripts/seed.ts` (or any direct Sanity API write)
  bypasses `/api/revalidate`**, so Next's persistent Data Cache
  (`.next/cache/fetch-cache`) has no signal to invalidate — it survives
  across `next build` runs by design (that's the same mechanism that makes
  on-demand `revalidateTag` work on a live deploy). Confirmed: reseeding
  Sanity, then running `next build && next start`, still served stale
  pre-seed Services/Testimonials data even though the build ran *after* the
  reseed — the fetch-cache directory itself predated it. Fix: `rm -rf .next`
  (the whole directory, not just `.next/cache/fetch-cache`) before rebuilding
  whenever verifying against freshly-seeded/edited content locally — a plain
  rebuild without clearing it first is not sufficient.

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
- The shell here is **zsh**, which reserves `status` (and `pipestatus`) as a
  read-only special variable — `status=$(...)` fails with "read-only
  variable: status" rather than assigning. Don't use `status` as a variable
  name in inline bash/zsh snippets; something like `chk` or `result` is safe.

### Graphite stacked-PR workflow — follow strictly, alongside `docs/BUILD_PLAN.md`'s phases

Every phase or sub-phase (`5a`/`5b`, `9a`/`9b` style — split when a phase
would blow past the ~400-line soft budget per PR, see `docs/BUILD_PLAN.md`'s
already-split phases for the pattern) goes through this exact sequence. Use
the `gt` command at every step that has one — substituting plain `git
push`/`gh pr create`/`gh pr merge` for the `gt` equivalent is what caused a
stacked-PR merge to go wrong once already (step 5 below explains why).

1. **Implement.** `gt create` off the *previous phase's branch*, not `main`
   — a stack, never branching straight off trunk for a sub-phase. **Pass the
   branch name as the positional argument up front —
   `gt create phase-<N><letter>-<slug> -a -m "<msg>"`** — rather than
   `gt create -a -m "<msg>"` alone, which auto-generates a name from the
   commit message that won't match the `phase-<N><letter>-<slug>` convention.
   Confirmed this session for a non-phase docs branch too (see the naming
   note below) — naming it up front sidesteps the rename step entirely. If a
   branch does end up with the wrong name anyway, fix it with **`gt branch
   rename <name>`, never plain `git branch -m`**. A plain `git branch -m`
   renames the ref but doesn't update Graphite's own metadata store, which
   still maps the *old* name to its parent/stack position — the renamed
   branch comes back from `gt log short` as `untracked` (confirmed: `gt
   branch info` then errors "Cannot perform this operation on untracked
   branch"). Recoverable with `gt track --parent <parent-branch>` (no commits
   lost — the fix is metadata-only), but `gt branch rename` avoids the whole
   detour.
   **Branch naming:** `phase-<N><letter>-<slug>` is for branches implementing
   a BUILD_PLAN.md phase. A standalone change to the planning docs themselves
   (not implementing any phase's code) doesn't fit that pattern — use
   `docs-<slug>` instead, matching the existing history (`docs-phase-11-gt-
   rename-gotcha`, `docs-auto-delete-branches`, etc. — check `gh pr list
   --state merged` the same way).
   **Mid-phase decision gates:** a sub-phase can define its own internal
   checkpoint, not just the end-of-implementation one in step 2 below — e.g.
   Phase 12b (typeface) and 12d (grid layout) each build a comparison, then
   explicitly *stop for review* before the rest of that sub-phase proceeds.
   Treat that stop exactly like step 2's "wait for approval" — don't
   continue past it on your own inference of which option the user would
   pick, even under auto-mode's normal bias toward not pausing. Check the
   phase's own BUILD_PLAN.md entry for language like "stop for review" before
   assuming a sub-phase is a single uninterrupted implementation pass.
2. **Wait for approval of the implementation** before doing anything below.
   Don't submit, open a PR, or merge unprompted.
3. **Submit, once approved:** `gt submit` (or `gt submit --stack` for the
   whole stack at once). Fill out the PR body immediately against
   `.github/PULL_REQUEST_TEMPLATE.md` via `gh pr edit` — never leave it
   blank. Branch names follow `phase-<N><letter>-<slug>` (e.g.
   `phase-9a-videos-feed`) — check `gh pr list --state merged` for the
   established slug style before naming a new one. **`gt submit
   --no-interactive` opens the PR in draft** ("new PRs will be created in
   draft mode" — its own stated behavior, not a guess) — follow the `gh pr
   edit` with `gh pr ready <n>` or it sits in draft indefinitely.
4. **Wait for approval again before merging.** Submitting is a separate
   approval from merging — being told to open/update a PR is not permission
   to merge it, even once CI is green. Say it's ready and stop. **Checking
   CI:** `gh pr checks <n> --watch --fail-fast` — one blocking call that
   polls until done and exits non-zero on the first failure. Don't hand-roll
   a polling loop: `gh pr checks` alone returns immediately with exit code 8
   while pending (not a bash error, don't retry-loop around it), and a
   naive `while` loop re-invoking it burns tool calls for no reason `--watch`
   doesn't already handle. Give the Bash call a `timeout` sized to this
   repo's actual CI duration (~1 min at Phase 10) rather than the 2-minute
   default's worth of retries.
5. **Merge with `gt merge`, never `gh pr merge` PR-by-PR.** `gt merge`
   understands the whole stack and merges/retargets it correctly in one
   operation. Manually merging one PR at a time with `gh pr merge
   --delete-branch` broke a stack here: deleting a merged PR's branch does
   **not** retarget the next PR in the stack to `main` — GitHub auto-*closes*
   it instead (its base branch just vanished out from under it), and a
   closed PR can't be reopened once that's happened. (Recovery, if it does
   happen again: open a fresh PR from the same still-intact branch against
   `main` — no commits are lost, the branch itself was never touched.)
6. **Clean up with `gt sync --delete-all` afterward.** It restacks whatever's
   left and deletes the *local* branch for anything merged/closed. The repo's
   GitHub setting "Automatically delete head branches" is **on**, so the
   remote branch is gone the moment a PR merges — no separate remote-cleanup
   step needed. (Before this was enabled, `gt sync` only deleted branches
   locally — `gt branch delete --help` says as much, "does not perform any
   action on GitHub or the remote repository," and there's no `gt` command
   that does; confirmed a merged branch stayed on GitHub after `gt sync`
   reported it deleted, back when this setting was off. If it's ever off
   again for some reason, fall back to `git push origin --delete <branch>`,
   verified with `git ls-remote --heads origin` — not the locally-cached
   `git branch -a`, which can lag behind what's actually on GitHub. Cleaned
   up 9 such pre-dating-the-setting branches this way once already — if
   `git push origin --delete` gets blocked by Claude Code's own auto-mode
   safety classifier on the first attempt even after the user approves it
   in chat, that's a harness-level permission gate, not a code problem;
   re-running the identical command after the user's approval — which
   surfaces the actual permission prompt — goes through.)

   **`gt sync --delete-all` does not clean up `graphite-base/<PR#>` branches**
   — the side branches Graphite itself creates on the remote while merging a
   stack, to track each PR's base during the sequential-merge process. These
   are separate from the actual feature branches `gt sync` targets, have no
   `gt` command that cleans them, and were found lingering on `origin` (5 of
   them, `graphite-base/31`–`35`) well after their PRs had merged and their
   real feature branches were long gone. Safe to delete once every PR in the
   stack is merged and confirmed via `gh pr list --state open` that nothing
   still bases off them: same `git push origin --delete <branch>` fallback
   as above, verified against `git ls-remote --heads origin`. Worth checking
   for after every stack merge, not just when a branch-count mismatch is
   spotted by hand.

**Maintaining this file:** when you hit a workflow, tooling, or consistency
gotcha a future agent would otherwise rediscover the hard way — not a
one-off — add it to the relevant section here proactively, in this same
concise/reference style, without waiting to be asked. Tell the user in your
response, briefly, that you did and what you added.

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
- **Verifying a production build while a `next dev` server might already be
  running on this machine: give the verification build its own `distDir`**
  (temporarily add `distDir: ".next-verify"` to `next.config.ts`, `npm run
  build`, `npm run start -- -p <other-port>`, then revert the config and
  `rm -rf .next-verify` when done). `next build`/`next dev` share the plain
  `.next` folder by default, and a build while dev is running clobbers the
  dev server's manifest out from under it — confirmed this actually happens,
  not just theoretical. `next build` also rewrites `tsconfig.json` (reformats
  it and adds `include` entries for whatever `distDir` was active); `git
  checkout -- tsconfig.json` after removing the temporary `distDir`.
- `next/image`'s `onLoad` is deferred behind an internal `img.decode()`
  promise — `fireEvent.load(img)` won't synchronously flip state in a test;
  wrap the assertion in `waitFor(...)`.
- "Reset state when a prop changes" is a `key`-remount job, not a
  `useEffect` — `setState` called unconditionally in an effect body trips
  the `react-hooks/set-state-in-effect` lint rule. Seen more than once in
  this build: extract the piece that needs to reset into its own component
  and give it `key={theChangingValue}` instead.

---

# Established patterns (Phase 9)

Phase 9 built the Videos tab: the feed (`/portfolio/videos`), the intercepting-
route player overlay, and the standalone `/portfolio/videos/[slug]` page.

## Page composition

- `app/layout.tsx`'s `<body>` is `flex min-h-dvh flex-col`, with `<main>` as
  `flex-1` — the sticky-footer pattern, so a page with too little content to
  fill the viewport (the standalone video page was the one that surfaced
  this) still pins `<Footer>` to the bottom instead of stranding it partway
  up. `<Header>` is `fixed`, so it's out of flow and unaffected either way.
  Applies globally, not just to that one page.

## Routing gotchas

- **A route segment can't mix a `loading.tsx`-driven Suspense boundary with
  a sibling parallel-route slot that resolves differently.** Giving
  `/portfolio/videos/[slug]/page.tsx` its own `loading.tsx`, on a layout that
  also owns the `@modal` slot for the intercepting route overlay, made the
  page hang on the loading spinner forever client-side and never swap to the
  real content — reproduced against both `next dev` and a clean `next build
  && next start`, so not a dev-server artifact. Next's own parallel-routes
  docs warn about exactly this class of mismatch ("if one slot is dynamic,
  all slots at that level must be dynamic"), though the failure mode here was
  a silent hang, not a build error. Fix was to drop that `loading.tsx` (the
  route is fast enough in practice without one) rather than keep fighting
  the combination — see the comment on `FilmPage` in that file. Worth
  checking for again before adding a `loading.tsx` to any route segment that
  shares a layout with a parallel-route slot.
- **`next dev`'s Turbopack can corrupt an intercepting route's own matcher
  across repeated hot-reloads**, throwing `Invalid interception route:
  /portfolio/videos/(.)(.)(.)[slug]...` (the `(.)` marker compounding a bit
  further each recompile) even though the file on disk still has a single,
  correct `(.)`. Confirmed by checking `.next/dev/logs/next-development.log`
  — the route table itself gets rebuilt wrong, not the source. A clean `next
  build` (see the isolated-`distDir` verification technique in "Testing &
  mobile-debugging gotchas" above) always showed the correct route once;
  this is dev-server/HMR state, not a code bug, and a dev-server restart
  clears it too.

## shadcn / Base UI gotchas (continued)

- **`DialogContent`'s hardcoded entrance animation
  (`data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95`, etc.)
  can't be cleanly cancelled via `className`** — tailwind-merge doesn't
  recognize those tw-animate-css utility names as conflicting with anything,
  so there's no override that reliably removes them (the same gap that made
  the `rounded-xl` default need a same-value `rounded-lg` pairing to actually
  cancel, not just a `rounded-control` override — see `photo-gallery.tsx`
  git history). Harmless for the photo lightbox (one `Dialog` instance for
  its whole open lifetime). Actively wrong for anything whose content can
  swap while mounted across separate React subtrees — e.g. a `loading.tsx`
  fallback replaced by the real page: the entrance animation replayed on
  that swap, reading as a flicker/pop rather than a quiet update. Fix:
  compose `DialogPrimitive.Backdrop`/`.Popup` (from `@base-ui/react/dialog`)
  directly instead of through `DialogContent` — not a vendored-file edit,
  just building from the same primitives `DialogContent` itself uses, one
  level lower, when its animation/sizing defaults don't fit. See
  `components/video-modal-shell.tsx`.

## Third-party embed gotchas

- **`@mux/mux-player-react`'s keyboard-focus ring is a separate override
  from its `primaryColor`/`secondaryColor`/`accentColor` props.** Those three
  theme the player's visible chrome; the focus ring (shown when tabbing to
  the play button, seek bar, etc.) is hardcoded by media-chrome to a blue
  `box-shadow` via its own CSS custom property, `--media-focus-box-shadow`.
  Left unset, it's a plain browser-blue ring that has no relationship to the
  rest of the color system. Pass it through the player's `style` prop (typed
  as `MuxPlayerCSSProperties`, not plain `CSSProperties`, since custom
  properties need that library's own index-signature type) — see
  `components/film-player.tsx`.
- Testing a component that renders `<MuxPlayer>`: the real `<mux-player>`
  custom element runs browser-only shadow-DOM rendering logic that throws in
  jsdom. Mock `@mux/mux-player-react`'s default export with a plain
  `createElement("mux-player", props)` stub — same "mock the external
  boundary" move as this repo's `next/navigation` mocks, just for a
  third-party web component instead of a framework API. See
  `components/film-player.test.tsx`.

---

# Established patterns (Phase 10)

Phase 10a built `/about` — portrait, heading, long-form copy sourced from
`siteSettings`.

## Sanity schema deploy

**Editing anything under `studio/schemaTypes/**` isn't done once it's merged
to `main` — the hosted Studio at `https://oros.sanity.studio/` is a separate
deploy target that only updates when told to.** Next's own Vercel deploy and
Studio's deploy are two independent pipelines; merging a PR does not trigger
either one.

1. Confirm CLI auth/project first: `npx sanity projects list` (run from
   `studio/`) — lists the project without mutating anything, so it's a safe
   check. If it prompts to log in, `npx sanity login` first.
2. Deploy with `npm run deploy` from `studio/` (wraps `sanity deploy`) —
   **never `sanity dev`'s local server** for anything meant to reach your
   friend; `dev` is local-only and closes when the process exits.
3. Verify with `npx sanity schema list` (also from `studio/`) — confirms the
   deployed schema doc updated; doesn't tell you the *field-level* diff, so
   spot-check the actual field in the Studio UI if the change is easy to
   miss.

This only pushes schema/config, never content — seeding or editing actual
documents is `scripts/seed.ts` or the Studio UI, a completely separate
concern. A schema change that adds a field (rather than renaming/removing
one) is safe to deploy anytime; existing documents just show the new field
empty until someone fills it in in Studio.

Phase 10b built `/contact` — the form, `/api/contact`, and the first real
`shadcn add` run since Phase 2b (Button/Dialog only, until now).

## shadcn / Base UI gotchas (continued)

- **`npx shadcn add sonner` pulls in `next-themes`** — its generated
  `components/ui/sonner.tsx` calls `useTheme()` from it to pick light/dark.
  SPEC.md §1 explicitly rules `next-themes` out (dark-only, committed via
  `<html className="dark">`). Fix at the vendored file: drop the
  `useTheme()` call, hardcode `theme="dark"` on the `<Sonner>` prop, then
  `npm uninstall next-themes`. Check any future `shadcn add` output for the
  same import before assuming the generated file is drop-in.
- **`npx shadcn add form` is a no-op under this project's `base-nova`
  style** — `npx shadcn add form --view` reports "No files." There's no
  vendored `form.tsx`/`FormField`/`FormMessage` layer the way classic
  shadcn styles have one; Base UI's philosophy is compositional, so forms
  are wired by hand with `react-hook-form` directly against the vendored
  `Input`/`Textarea`/`Label`/`Select` — `useForm` + `register()` for plain
  inputs, `Controller` for `Select` (a Base UI `Select.Root`, not a native
  `<select>`, so it can't take `register()`). See `components/contact-form.tsx`.
- **Base UI's `Select` needs an `items` prop to show the right label after
  a choice is made**, if you're using declarative `<Select.Item>` children
  (the shadcn-generated pattern) rather than the `items`-array API. Without
  it, the trigger's `<Select.Value>` falls back to stringifying the raw
  stored value once the popup (and its `<Select.Item>`s) unmounts — e.g.
  showing `"commercial"` instead of `"Commercial"`. Confirmed as a real
  browser bug, not just a test artifact: pass `items={Object.fromEntries(...)}`
  (value → label) to `Select`/`Select.Root` alongside the `<SelectItem>`
  children — see `INQUIRY_TYPE_ITEMS` in `components/contact-form.tsx`.
- **Base UI `Select` switching from uncontrolled to controlled logs a React
  warning** if a `react-hook-form`-controlled field's initial value is
  `undefined` (RHF's own default for a field with no `defaultValues` entry)
  and later becomes a real string — Base UI decides controlled-vs-not from
  whether the *first* render's value is `undefined`. Fix: pass
  `value={field.value ?? ""}` (not the bare `field.value`) so the first
  render is already controlled with a defined "nothing selected" value;
  `<Select.Value>` treats `""` the same as `null`/`undefined` for showing
  the placeholder.
- **Clicking a `<Select.Item>` other than the first one doesn't register in
  jsdom/Testing Library**, even though it works correctly in a real browser
  (verified manually against a live dev server after fixing the `items`
  issue above) — `fireEvent.click()` on the first item selects it fine, but
  the same call on the second+ item leaves the popup open and the value
  unchanged. Root cause not isolated (likely Base UI's pointer-based
  highlight tracking not initializing the way a real browser's pointer
  events do). Workaround, not a fix: when a test only needs *some* value
  selected — not that specific option's behavior — pick the first item.
  See `selectInquiryType` in `components/contact-form.test.tsx`.
- **Base UI's `Select` measures the trigger's width once and doesn't
  re-measure it if the window resizes while the popup is closed.**
  Confirmed by hand: open the popup at a wide viewport (so the trigger is
  wide), close it, shrink the browser window *without reloading*, reopen —
  the popup still renders at the old, wider size and pokes off the right
  edge of the now-narrower viewport. This is a real, resize-a-live-window
  bug, not a test artifact (this project's `Browser` pane tool's
  `resize_window` doesn't always fire a real `resize` DOM event either,
  which briefly looked like the fix wasn't working — dispatching one by
  hand confirmed it does). Fix: `key`-remount the `Select` on a real width
  change so it re-measures fresh next time it opens — bucket and debounce
  the resize listener so a window drag doesn't remount on every pixel. See
  `useLayoutWidthBucket` in `components/contact-form.tsx`. Also cap the
  trigger's own container width (`max-w-xl` on `/contact`'s form column,
  previously an uncapped `1fr` grid track) so the *ceiling* of how wide it
  can ever get is reasonable regardless.

## Env vars & secrets (continued)

- Resend needs a **verified sending domain** to send `from` a real address;
  until Phase 13 sets one up, `/api/contact` sends from Resend's shared
  sandbox address (`onboarding@resend.dev`) — sending still works today,
  delivery just isn't from `@oros...` yet. Swap `FROM_ADDRESS` in
  `app/api/contact/route.ts` once a domain is verified.

---

# Established patterns (Phase 13)

Phase 13 built SEO/analytics/system pages: per-route metadata, `next/og` OG
images, `sitemap.ts`/`robots.ts`, partial LocalBusiness JSON-LD, Vercel
Analytics, `not-found`/`error`/`loading`, and empty states for filtered
views. `NEXT_PUBLIC_SITE_URL` (new env var, see `.env.example`) backs
`metadataBase`/sitemap/robots/JSON-LD — Phase 15 assigned the real (but
still temporary) Vercel domain, `oros-productions.vercel.app`; swap again
once the friend's own domain is live and connected.

## Favicons

- **`app/icon.svg`'s hand-written comment contained a literal `--` inside
  the comment body** (`(--accent-solid)`), which is invalid XML — comments
  can't contain `--` anywhere except the opening/closing delimiters
  themselves. Browsers' lenient SVG parsers rendered it fine, masking the
  bug, but strict XML parsers (confirmed: `sharp`/`librsvg`, used for the
  favicon-generation work below) refused to parse it at all — a plausible
  cause of the favicon silently failing in some non-browser consumers.
  Regression-guarded by `app/icon.test.ts`, which greps every comment body
  for `--`. Watch for this in any future SVG comment.
- **`icon.svg` alone isn't enough for full favicon coverage** — Next also
  supports `favicon.ico` (root `app/` only, the universal legacy fallback)
  and `apple-icon.png` (iOS/Safari home-screen/bookmark icon) as sibling
  file conventions, neither of which existed before Phase 13. Generated
  both from the same ridgeline mark: `sharp` rasterizes `icon.svg` to PNG
  at each target size, then ImageMagick's `convert` combines multiple PNGs
  into one multi-resolution `.ico` (`sharp` itself can't emit `.ico`).
  `apple-icon.png` needs an opaque background (Apple's own guidance — a
  transparent one can render as solid black on older iOS) — used the same
  `app-bg`/`sand-1` (`#111110`) the rest of the dark theme is built on,
  matching `opengraph-image.tsx`'s treatment.

## Next.js metadata gotchas

- **A route's own `openGraph` object silently drops the parent's
  file-convention OG image.** `next/og`'s `opengraph-image.tsx` file
  convention only auto-attaches to a segment that does *not* otherwise
  define its own `openGraph` metadata; once a route returns one (needed
  here for per-page title/description), the image inherited from an
  ancestor segment — e.g. the root `app/opengraph-image.tsx` — is dropped
  rather than merged in. Confirmed by hand: `/portfolio/photos` showed no
  `og:image` meta tag at all until its `openGraph` object explicitly named
  `images: ["/opengraph-image"]`. Fix: `lib/metadata.ts`'s `pageMetadata()`
  defaults `image` to `"/opengraph-image"` for every route; a route with
  its *own* sibling `opengraph-image.tsx` (the film page's dynamic
  per-thumbnail one) passes `image: null` to opt out, since that one
  attaches correctly on its own and would otherwise be clobbered by the
  generic default.
- **The same shallow-replace rule applies to `twitter`**: a route-level
  `twitter` object without a `card` field silently reset the card type from
  the root layout's `summary_large_image` back to Next's own default
  `summary`. `pageMetadata()` sets `card: "summary_large_image"` explicitly
  on every call rather than relying on inheritance.
- **`next/og`'s `ImageResponse` needs real font bytes, not a `next/font`
  loader** — Satori can't consume what `next/font/google` produces. Fetch a
  static (non-variable) instance from Google Fonts directly: requesting the
  CSS2 endpoint with an old-Firefox `User-Agent` string gets back a `.ttf`
  `src` URL (a modern UA gets `.woff2`, which older Satori/Resvg parses
  less reliably) — download that once and commit it (`app/fonts/
  fraunces-og-600.ttf`), then `readFile(join(process.cwd(), ...))` it at
  request time per Next's own documented pattern. Only `ttf`/`otf`/`woff`
  are supported, `ttf`/`otf` preferred for parse speed.
- **This Next version's `error.js` convention exposes `unstable_retry`, not
  `reset`, as the primary recovery API** — the bundled docs say to prefer
  it ("in most cases, you should use `unstable_retry()` instead"); `reset`
  still exists but is now the fallback case. `app/error.tsx` uses
  `unstable_retry`.

## Testing gotcha

- **Never name a component (or anything else) `Error`, even locally within
  a file — it silently breaks React hooks in this test environment.**
  `app/error.tsx`'s default export was originally named `Error` (matching
  Next's own doc examples), and every hook in it threw "Cannot read
  properties of null (reading 'useEffect')" — the classic invalid-hook-call
  symptom — only in Vitest/RTL, not confirmed as a real-browser issue but
  not worth the risk either way. Renaming the function to `RouteError`
  (the file/export-default convention Next actually requires is unrelated
  to the function's own name) fixed it immediately. Don't reuse a global
  built-in's name for a component identifier.

## Tooling gotcha

- **`npm install @vercel/analytics` throws an ERESOLVE conflict** over an
  irrelevant optional peer: `@vercel/analytics` optionally supports
  SvelteKit, whose own peer (`@sveltejs/vite-plugin-svelte`) wants
  `vite@^8`, conflicting with the `vite@7.x` this repo's `vitest` already
  installs. **Use `npm install @vercel/analytics --force`, not
  `--legacy-peer-deps`** — `--force` bypasses just that one conflict and
  installs cleanly (confirmed: `npm test` still 123/123 green after);
  `--legacy-peer-deps` reflows the *entire* dependency tree under npm v6
  resolution rules and silently dropped `@testing-library/dom`, breaking
  every test file with "Cannot find package '@testing-library/dom'" until
  reverted.

---

# Established patterns (Phase 15)

Phase 15 added Playwright E2E and shipped the first live deploy —
`oros-productions.vercel.app`, a temporary Vercel-assigned domain until the
friend's own domain is connected and `NEXT_PUBLIC_SITE_URL` swaps again.

## Playwright / E2E

- `playwright.config.ts` boots a local production build (`next build && next
  start`) by default. Set `PLAYWRIGHT_BASE_URL` to point the same four specs
  at a real deploy instead (what "all four specs pass against a preview
  deploy," BUILD_PLAN.md's Phase 15 done-when criterion, actually means) —
  `webServer` is skipped entirely in that case rather than trying to boot a
  local server nothing will use.
- **`e2e/` must be excluded from Vitest's own test discovery**
  (`vitest.config.ts`'s `test.exclude`) — Playwright's `test`/`expect`
  imports aren't Vitest's, and without the exclude Vitest picks up every
  `*.spec.ts` under `e2e/` and fails them all with import errors. Two
  separate test runners, two separate directories they each need to ignore.
- The video-playback spec runs against **real Mux content** (whatever film
  is first in the seeded/published data), not a mock — media-chrome's
  controls (mux-player's underlying UI) render in an *open* shadow DOM, so
  Playwright's role-based locators (`getByRole("button", { name: /^play$/i
  })`) pierce it automatically without any special shadow-DOM handling.

## Vercel deploy

- **This repo has two `package.json`s** (root Next app + `studio/`, a fully
  separate package per the Tooling section above) — when importing the
  project into Vercel, the Root Directory setting must stay `.` (repo
  root), not get pointed at `studio/`. Vercel's monorepo detection can
  surface both as candidates during import; picking wrong builds the wrong
  package entirely.
- `NEXT_PUBLIC_SITE_URL` is inlined at **build** time (it backs
  `metadataBase`/sitemap/robots/JSON-LD) — setting it in Vercel's project
  settings after a deploy already happened doesn't retroactively fix that
  deploy's output; a fresh build is required. Confirmed by hand: the first
  deploy (env var deliberately left unset until the assigned domain was
  known) served `sitemap.xml` and `og:url` still pointing at
  `http://localhost:3000`, `lib/site.ts`'s dev fallback, until a redeploy
  after setting the var picked it up.

## Sanity webhook (production revalidation)

- **No webhook existed at all until Phase 15** — confirmed via `npx sanity
  hooks list` (studio/) returning empty — which is the actual root cause
  behind a real bug report ("publishing a new hero video doesn't show up
  on the live site"): every Sanity query has been correctly `revalidateTag`-tagged
  since Phase 4, but nothing was ever calling `/api/revalidate` in
  production to begin with. Not specific to the hero — this affected every
  document type.
- **`npx sanity hooks create` (this CLI version) doesn't create anything
  programmatically** — despite taking the same flags as `list`/`delete`, it
  just opens `manage.sanity.io/.../api/webhooks/new` in a browser for manual
  entry (confirmed by reading `@sanity/cli`'s own source,
  `node_modules/@sanity/cli/dist/commands/hooks/create.js`). There's no
  `--unattended`-friendly path through the CLI itself.
- **Scripted creation instead, direct against the Management HTTP API**
  (`POST https://api.sanity.io/v2021-06-07/hooks/projects/{projectId}`,
  bearer token from `~/.config/sanity/config.json`'s `authToken` — the same
  auth the CLI itself already uses) — but the public docs' field names are
  misleading for this API version. What actually validates, found by
  reading the Joi validation errors back one field at a time: trigger
  events and the GROQ filter are **nested under a `rule` object**, not
  top-level (`rule: { on: ["create","update","delete"], filter: "..." }` —
  note `on` wants present-tense `create`/`update`/`delete`, not
  `created`/`updated`/`deleted` despite some published examples suggesting
  otherwise), and `filter` as a bare top-level string (what most webhook
  docs show) is rejected outright ("must be of type object") because it's
  not nested. `secret` is the same value as `SANITY_REVALIDATE_SECRET`
  end-to-end — the shared secret `/api/revalidate` already verifies
  requests against.
- Verify the endpoint side independently of whether Sanity's webhook is
  configured right: `@sanity/webhook`'s `isValidSignature` has no matching
  "sign a payload" export, so you can't easily hand-craft a fully-valid
  signed test request — the practical verification is confirming the
  webhook exists with the right URL/dataset/filter (`npx sanity hooks
  list`) and then having a real publish in Studio confirm it end-to-end.
