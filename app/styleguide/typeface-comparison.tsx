import { Instrument_Serif, Fraunces, Bodoni_Moda, DM_Serif_Display } from "next/font/google";

/**
 * Phase 12b comparison scaffolding (docs/BUILD_PLAN.md) — delete this file
 * and its import/usage in page.tsx once the typeface decision lands and
 * DESIGN.md §5 is rewritten.
 */

const HEADLINE = "Scaling new heights in cinematic storytelling.";
const BODY =
  "Oros Productions is a photography and videography studio working across weddings, commercial work, portraiture, and ministry film.";
const CAPTURE = "NIKON Z8 · 85MM · ƒ1.4 · 1/200";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400" });
const fraunces = Fraunces({ subsets: ["latin"], weight: "400" });
const bodoniModa = Bodoni_Moda({ subsets: ["latin"], weight: "400" });
const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

const CANDIDATES = [
  {
    name: "Instrument Serif",
    note: "Current default (DESIGN.md §5) — high-contrast, tight, editorial.",
    font: instrumentSerif,
  },
  {
    name: "Fraunces",
    note: 'Soft high-contrast serif with "wonky"/optical-size character — warmer, more crafted.',
    font: fraunces,
  },
  {
    name: "Bodoni Moda",
    note: 'True Didone — extreme thick/thin contrast, the most literal "film title card" read.',
    font: bodoniModa,
  },
  {
    name: "DM Serif Display",
    note: "Restrained high-contrast serif, closer to a classic editorial masthead.",
    font: dmSerifDisplay,
  },
];

export function TypefaceComparison() {
  return (
    <div className="space-y-12">
      {CANDIDATES.map((c) => (
        <div key={c.name} className="border-border space-y-3 border-b pb-8 last:border-b-0">
          <p className="font-mono text-text-secondary text-xs tracking-widest uppercase">
            {c.name} — {c.note}
          </p>
          <h3 className={`${c.font.className} text-text-primary text-5xl leading-tight md:text-6xl`}>
            {HEADLINE}
          </h3>
          <p className="font-body text-text-secondary max-w-prose">{BODY}</p>
          <p className="text-text-accent font-mono text-xs tracking-widest uppercase">{CAPTURE}</p>
        </div>
      ))}
    </div>
  );
}
