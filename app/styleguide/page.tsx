import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

type Swatch = { label: string; cssVar: string; className: string };

const backgrounds: Swatch[] = [
  { label: "app-bg", cssVar: "--app-bg", className: "bg-app-bg" },
  { label: "app-bg-subtle", cssVar: "--app-bg-subtle", className: "bg-app-bg-subtle" },
  { label: "surface", cssVar: "--surface", className: "bg-surface" },
  { label: "surface-hover", cssVar: "--surface-hover", className: "bg-surface-hover" },
];

const componentStates: Swatch[] = [
  { label: "component", cssVar: "--component-bg", className: "bg-component" },
  { label: "component-hover", cssVar: "--component-bg-hover", className: "bg-component-hover" },
  { label: "component-active", cssVar: "--component-bg-active", className: "bg-component-active" },
  { label: "component-accent", cssVar: "--component-accent-bg", className: "bg-component-accent" },
  {
    label: "component-accent-hover",
    cssVar: "--component-accent-bg-hover",
    className: "bg-component-accent-hover",
  },
  {
    label: "component-accent-active",
    cssVar: "--component-accent-bg-active",
    className: "bg-component-accent-active",
  },
];

const borders: Swatch[] = [
  { label: "border", cssVar: "--border-subtle", className: "border-border" },
  { label: "border-interactive", cssVar: "--border-interactive", className: "border-border-interactive" },
  { label: "border-strong", cssVar: "--border-strong", className: "border-border-strong" },
];

const ridgeline: Swatch[] = [
  { label: "ridgeline", cssVar: "--rule-ridgeline", className: "bg-ridgeline" },
  { label: "ridgeline-strong", cssVar: "--rule-ridgeline-strong", className: "bg-ridgeline-strong" },
];

const solids: (Swatch & { textClassName: string })[] = [
  {
    label: "accent-solid",
    cssVar: "--accent-solid",
    className: "bg-accent-solid",
    textClassName: "text-text-on-accent-solid",
  },
  {
    label: "accent-solid-hover",
    cssVar: "--accent-solid-hover",
    className: "bg-accent-solid-hover",
    textClassName: "text-text-on-accent-solid",
  },
  {
    label: "light-solid",
    cssVar: "--light-solid",
    className: "bg-light-solid",
    textClassName: "text-text-on-light-solid",
  },
  {
    label: "light-solid-hover",
    cssVar: "--light-solid-hover",
    className: "bg-light-solid-hover",
    textClassName: "text-text-on-light-solid",
  },
];

const textTokens: Swatch[] = [
  { label: "primary", cssVar: "--text-primary", className: "text-text-primary" },
  { label: "secondary", cssVar: "--text-secondary", className: "text-text-secondary" },
  { label: "accent", cssVar: "--text-accent", className: "text-text-accent" },
  { label: "accent-strong", cssVar: "--text-accent-strong", className: "text-text-accent-strong" },
  { label: "light", cssVar: "--text-light", className: "text-text-light" },
];

export default function StyleguidePage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main className="bg-app-bg text-text-primary min-h-screen space-y-16 px-8 py-16">
      <header>
        <p className="font-mono text-xs tracking-widest text-text-secondary uppercase">
          Dev only — docs/DESIGN.md §4 &amp; §5
        </p>
        <h1 className="font-display text-5xl">Styleguide</h1>
      </header>

      <Section title="Backgrounds & surfaces">
        <SwatchRow swatches={backgrounds} />
      </Section>

      <Section title="Component states">
        <SwatchRow swatches={componentStates} />
      </Section>

      <Section title="Borders">
        <div className="flex flex-wrap gap-6">
          {borders.map((b) => (
            <div key={b.label} className="space-y-2">
              <div className={`h-16 w-32 border-2 ${b.className}`} />
              <Label swatch={b} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Ridgeline dividers">
        <div className="max-w-md space-y-6">
          {ridgeline.map((r) => (
            <div key={r.label} className="space-y-2">
              <div className={`h-px w-full ${r.className}`} />
              <Label swatch={r} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Solid backgrounds">
        <div className="flex flex-wrap gap-6">
          {solids.map((s) => (
            <div key={s.label} className="space-y-2">
              <div
                className={`flex h-16 w-32 items-center justify-center rounded-control ${s.className} ${s.textClassName}`}
              >
                <span className="font-mono text-xs">Aa</span>
              </div>
              <Label swatch={s} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Text">
        <div className="space-y-3">
          {textTokens.map((t) => (
            <div key={t.label} className="flex items-baseline gap-4">
              <span className={`font-body text-lg ${t.className}`}>The quick brown fox</span>
              <Label swatch={t} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Overlay & focus ring">
        <div className="flex flex-wrap items-center gap-8">
          <div className="space-y-2">
            <div className="bg-overlay h-16 w-32 rounded-control" />
            <Label swatch={{ label: "overlay", cssVar: "--overlay", className: "bg-overlay" }} />
          </div>
          <div className="space-y-2">
            <div className="bg-component h-16 w-32 rounded-control ring-2 ring-focus-ring ring-offset-2 ring-offset-app-bg" />
            <Label swatch={{ label: "focus-ring", cssVar: "--focus-ring", className: "ring-focus-ring" }} />
          </div>
        </div>
      </Section>

      <Section title="Scrim">
        <div className="scrim relative h-40 w-64 rounded-control bg-component-accent">
          <p className="absolute right-3 bottom-3 left-3 font-mono text-xs text-text-primary uppercase">
            Type over photograph
          </p>
        </div>
      </Section>

      <Section title="Type scale">
        <div className="space-y-6">
          <p className="font-display text-5xl">Scaling new heights in cinematic storytelling.</p>
          <p className="font-body max-w-prose text-text-secondary">
            Oros Productions is a photography and videography studio working across weddings,
            commercial work, portraiture, and ministry film.
          </p>
          <p className="font-mono text-xs tracking-widest text-text-accent uppercase">
            NIKON Z8 · 85MM · ƒ1.4 · 1/200
          </p>
        </div>
      </Section>

      <Section title="shadcn + Base UI bridge">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-mono text-sm tracking-widest text-text-accent uppercase">{title}</h2>
      {children}
    </section>
  );
}

function SwatchRow({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {swatches.map((s) => (
        <div key={s.label} className="space-y-2">
          <div className={`h-16 w-32 rounded-control ${s.className}`} />
          <Label swatch={s} />
        </div>
      ))}
    </div>
  );
}

function Label({ swatch }: { swatch: Swatch }) {
  return (
    <p className="font-mono text-xs text-text-secondary">
      <span className="block">{swatch.label}</span>
      <span className="block">{swatch.cssVar}</span>
    </p>
  );
}
