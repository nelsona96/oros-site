# Oros Productions — Design Brief

Pass 1: creative direction. Technical scope is a separate document.

---

## 1. The brand

**Oros** — Greek ὄρος, "mountain." The reference is deliberate.

**Motto:** *Scaling new heights in cinematic storytelling.*

**Services (four verticals, equal billing):**

| Vertical | What it is | Design consequence |
|---|---|---|
| Weddings & events | Couples, families, celebrations | Trust-driven; the About block matters most here |
| Commercial & brand | Product, interiors, campaign work | Credibility document; needs to look studio-grade |
| Portrait & editorial | Headshots, musicians, personal branding | The photographer's eye is the product |
| Ministry | Worship services, worship music, testimony films | Long-form video with real audio; warm sanctuary light |

**The site's job:** be a credible home base. No single vertical leads. The chrome stays
quiet and the photographs do every bit of the differentiating.

**Voice:** professional throughout, with the faith behind the work present and honest —
stated plainly in the About and ministry copy, never preached site-wide. A church media
director should recognize their own; a commercial buyer should never feel filtered out.

---

## 2. Mood

**Elegant. Cinematic. Golden hour.**

The room is a **screening room** — dark surround, images and video glowing out of it.
Not a white gallery. A dark ground is chromatically inert: a white page shifts how every
adjacent image is perceived and competes to be the brightest thing on screen. Dark lets
the photograph be the only light source. Same reason NLEs and Lightroom ship dark.

**Dark mode only, committed.** One surface tuned properly. Commitment reads as art
direction; a sun/moon toggle on a photographer's site reads as a developer's site. The
token layer below is built so light mode remains addable later without touching
components.

Never `#000`. Images with dark edges bleed into pure black and lose their frame.

---

## 3. Signature — alpenglow

Four things converge on one idea:

- Oros = mountain
- "Scaling new heights" = ascent
- Golden hour = low sun
- Sand → Gold → Amber = a warm falloff

**Alpenglow**: the warm light that catches a summit while the valley below is still in
shadow. Sand is unlit rock, gold is the slope taking light, amber is the peak in full
sun. The palette is not a tasteful color choice — it is a description of a real thing.

It also resolves the ministry tone problem. A mountain carries real weight for a church
audience (Olivet, the Sermon) with no devotional language at all, and reads as landscape
and ambition to everyone else. One mark, two honest readings.

**How it appears — three devices, nothing else:**

1. **Sunrise on load.** The hero comes up in brightness and warmth rather than fading in
   from transparent — a projector lamp reaching temperature, amber briefly strongest at
   the edges before settling. ~2s, once per session.
2. **Ridgeline rules.** Section dividers are hairlines in `gold-6` carrying a faint
   gold→amber gradient at a single point — light catching one spot on a ridge.
3. **The ascent.** Surfaces warm from sand toward gold as you scroll, peaking at the
   contact block. **Only furniture warms — never the ground behind photographs.**

**Ridgeline mark.** One minimal geometric summit line: logo, favicon, section divider.
Reusable for invoices, watermarks, and socials.

**The summit is the CTA.** You begin in shadow under the hero loop and end in full light
on the ask. The contact block is the warmest, brightest moment on the site — gold
surfaces and the one full-strength amber element. The conversion point is the payoff of
the metaphor, not a box at the bottom.

---

## 4. Color system — Radix Colors

Every value comes from a named Radix scale. No invented hex anywhere.

### Scales chosen

| Role | Scale | Why |
|---|---|---|
| Gray | **Sand** | Radix's *natural pairing* guidance pairs sand and olive with yellows and oranges. Sand is the yellow-hued gray, so it sits under a gold accent without the clash the docs warn about for saturated grays in dark mode. `--sand-1: #111110` is a near-neutral charcoal — warm enough to belong, neutral enough not to tint photographs. |
| Accent — material | **Gold** | A *metal* scale: low chroma by design (`--gold-9: #978365`, `--gold-11: #cbb99f`). Reads as champagne and gilding, not as a bright brand color. Carries liturgical weight for the ministry work that a generic warm hue would not. On Radix's **white-text** list. |
| Accent — light | **Amber** | `--amber-9: #ffc53d` is literally low-angle sunlight. Supplies the luminance gold cannot: at the sizes accents actually appear (1px rules, 11px caps, a tab underline) gold alone disappears into sand and photographs as beige. On Radix's **dark-text** list — see the contrast rule below. |

**Not Slate + Blue.** Cool neutrals contradict every adjective in this brief.

**Three scales, one idea:** things closer to the light get hotter. Sand is the inert
room, gold is material catching light, amber is the light itself. This is a single
concept with falloff, not two competing accents — the boldness stays spent in one place.

### Semantic aliases

Components reference these tokens only. They never reference `--sand-3` directly.
Per the aliasing docs, names are generic and use-case based, not component-specific
(no `--card-bg`).

**Backgrounds (steps 1–2)**

| Token | Value | Use |
|---|---|---|
| `--app-bg` | `sand-1` | Page ground. Sits behind all photography — stays neutral so images render true. |
| `--app-bg-subtle` | `sand-2` | Alternating section bands. |
| `--surface` | `gold-2` | Cards, panels, the video player shell. **Warm furniture on a neutral floor** — warmth arrives where you touch the UI, never behind the work. |
| `--surface-hover` | `gold-3` | |

**Component backgrounds (steps 3–5)**

| Token | Value | Use |
|---|---|---|
| `--component-bg` | `sand-3` | Inputs, inactive tabs, chips — normal state. |
| `--component-bg-hover` | `sand-4` | Hover. |
| `--component-bg-active` | `sand-5` | Pressed / selected. |
| `--component-accent-bg` | `gold-3` | Gold-toned controls — normal. |
| `--component-accent-bg-hover` | `gold-4` | |
| `--component-accent-bg-active` | `gold-5` | |

**Borders (steps 6–8)**

| Token | Value | Use |
|---|---|---|
| `--border-subtle` | `sand-6` | Non-interactive: card edges, dividers, image frames. |
| `--border-interactive` | `sand-7` | Interactive component borders. |
| `--border-strong` | `sand-8` | Stronger emphasis on interactive borders. |
| `--rule-ridgeline` | `gold-6` | The signature hairline divider. |
| `--rule-ridgeline-strong` | `gold-7` | Its lit segment. |

**Solid backgrounds (steps 9–10)**

| Token | Value | Use |
|---|---|---|
| `--accent-solid` | `gold-9` | Primary buttons, filled controls. |
| `--accent-solid-hover` | `gold-10` | |
| `--light-solid` | `amber-9` | **The hot element.** Play control, active tab underline, the summit CTA. |
| `--light-solid-hover` | `amber-10` | |

**Text (steps 11–12)**

| Token | Value | Use |
|---|---|---|
| `--text-primary` | `sand-12` | Headings, body copy. |
| `--text-secondary` | `sand-11` | Captions, meta, supporting copy. |
| `--text-accent` | `gold-11` | Eyebrows, capture metadata, small caps labels. |
| `--text-accent-strong` | `gold-12` | Display headings wanting warmth. |
| `--text-light` | `amber-11` | Active nav, rare emphasis. |
| `--text-on-accent-solid` | `white` | On `gold-9`. Gold is a white-text scale. |
| `--text-on-light-solid` | `sand-1` | On `amber-9`. **Amber is a dark-text scale — white on amber-9 fails contrast.** |

**Alpha & overlays**

| Token | Value | Use |
|---|---|---|
| `--scrim` | `black-a` gradient | Type legibility over photographs. Must be alpha, never a solid — a solid scrim kills the image beneath it. |
| `--overlay` | `black-a9` | Behind the video player overlay. |
| `--focus-ring` | `amber-9` | See deviation note. |

**Documented deviation:** step 8 is the documented focus-ring step, but `amber-8`
(`#8f6424`) against `sand-1` (`#111110`) is marginal for WCAG 2.4.11 focus visibility.
The ring uses `amber-9` instead — the designated light token, unambiguously visible.
This is the only place the brief departs from the step semantics, and it departs
upward.

### Setup

Install `@radix-ui/colors`. Import **only the dark variants** — `sand-dark.css`,
`gold-dark.css`, `amber-dark.css`, plus `sand-dark-alpha.css`, `gold-dark-alpha.css`,
`black-alpha.css`. Radix dark scales are scoped to `.dark, .dark-theme`, so `<html>`
carries `className="dark"` permanently.

Semantic aliases are declared once in global CSS and mapped into the Tailwind theme, so
components write `bg-surface` and `text-secondary` — never `bg-[var(--sand-1)]`.

**Discipline rule:** at most two or three amber elements in any viewport. Amber is the
sun; more than one sun and the falloff collapses.

---

## 5. Typography

| Role | Face | Job |
|---|---|---|
| Display | **Instrument Serif** | High-contrast, tight, editorial. Genuinely cinematic set large — a film title card, not a wedding script. |
| Body | **Instrument Sans** | Clean, quiet, related by family. |
| Utility | **IBM Plex Mono** | Capture metadata, credits, category labels, running times. |

All free, all load via `next/font`.

**Deliberately avoided:** Playfair Display + letterspaced Montserrat (every photographer
template ships it), and Inter (reads as "a developer chose this").

**Capture metadata as a typographic element.** `NIKON Z8 · 85MM · ƒ1.4 · 1/200` set in
mono beneath an image is real information from the subject's own world. It earns the
third type role instead of decorating, and it signals made-by-a-photographer rather than
made-from-a-template.

---

## 6. Layout & density

**Mobile-first, responsive up to desktop.** Phone layout is the design; desktop is the
expansion.

Justified rows with generous outer margins — variable-width images justified into full
rows with original aspect ratios preserved, tight gutters, wide margins. Volume and
range without cropping anyone's composition, and it handles mixed portrait/landscape
gracefully. Collapses to one or two per row on mobile.

Cropped uniform grids are rejected: overriding the photographer's framing is a real cost
on a site whose entire argument is that they compose well.

---

## 7. Landing page

1. **Hero film loop.** Silent, looped, autoplaying, **no controls, not clickable** —
   pure atmosphere. Full viewport height on desktop; on tablet and phone it stops short
   so the next section peeks up, signalling there's more below. Opens with the sunrise
   warm-up. Anyone wanting to actually watch something goes to the Videos tab.
2. **Selected work.** A cross-vertical cut, leading into the portfolio.
3. **Services.** All four verticals named explicitly. This is the mechanism that lets
   one site serve four audiences without fracturing — visitors self-select rather than
   guessing whether they're in the right place.
4. **About + portrait.** Their face, their name, two or three sentences. The
   highest-converting block for wedding clients, who are hiring a person to be present
   at something irreplaceable — not buying image files.
5. **Social proof.** Testimonials and a quiet row of client/venue/church marks.
   *Content dependency: needs real quotes and permission to use marks.*
6. **Contact — the summit.** Warmest surfaces, brightest amber, the payoff of the ascent.

---

## 8. Portfolio

Two tabs, never mixed.

**Photos** — justified rows per §6, with category filters (Weddings / Commercial /
Portrait / Ministry). Four verticals in a flat grid reads as a shoebox; a commercial
visitor should not scroll past forty wedding frames to reach a product shot. Capture
metadata in mono on the detail view.

**Videos** — a YouTube feed. Single column of large 16:9 thumbnail cards on mobile with
title and meta beneath, widening to a multi-column grid on desktop. Duration badge,
title, category. **No inline autoplay anywhere.** Clicking opens a full-bleed player
overlay — dark surround, amber controls, grid still behind it — rather than navigating
away. The screening room doing its job.

---

## 9. Motion

Restrained, plus the ascent.

- Sunrise warm-up on the hero, once per session
- Images fade up as they enter view
- Considered hover states on cards and controls
- Surfaces warming sand → gold down the page, peaking at contact

No parallax, no staggered grid cascades, no custom cursor. Cinematic sites tip into
showreel-for-the-developer quickly, and every one of those costs MVP time.

`prefers-reduced-motion` disables the warm-up, the fade-ups, and the scroll warming.
The hero loop respects it too — poster frame only.

---

## 10. Quality floor

Not features, just non-negotiable: responsive to mobile, visible keyboard focus using
`--focus-ring`, `prefers-reduced-motion` honored, alt text on every photograph, captions
on ministry and wedding films where speech carries meaning.

---

## 11. Open content dependencies

Design decisions are settled; these are assets the build will need.

- Hero loop: a silent, seamlessly looping cut with a poster frame
- Ridgeline mark as SVG
- Testimonial quotes and permission for client/venue/church marks
- A portrait of the photographer
- Capture metadata for images where it's shown
- Whether pricing appears at all — deferred, currently omitted
