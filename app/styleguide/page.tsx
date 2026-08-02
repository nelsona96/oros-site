import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Body, Display, Eyebrow, Lead } from "@/components/typography";
import { Ridgeline } from "@/components/ridgeline";
import { RidgelineMark } from "@/components/ridgeline-mark";

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

const ridgelineTokens: Swatch[] = [
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
    <div className="bg-app-bg text-text-primary min-h-screen">
      <Container className="space-y-16 py-16">
        <header>
          <Eyebrow>Dev only — docs/DESIGN.md §3, §4 &amp; §5</Eyebrow>
          <Display size="lg">Styleguide</Display>
        </header>

        <Block title="Ridgeline mark">
          <div className="flex flex-wrap items-center gap-8">
            <RidgelineMark className="text-text-primary h-8 w-auto" />
            <RidgelineMark className="text-text-accent h-12 w-auto" />
            <RidgelineMark className="text-text-light h-16 w-auto" />
          </div>
        </Block>

        <Block title="Backgrounds & surfaces">
          <SwatchRow swatches={backgrounds} />
        </Block>

        <Block title="Component states">
          <SwatchRow swatches={componentStates} />
        </Block>

        <Block title="Borders">
          <div className="flex flex-wrap gap-6">
            {borders.map((b) => (
              <div key={b.label} className="space-y-2">
                <div className={`h-16 w-32 border-2 ${b.className}`} />
                <Label swatch={b} />
              </div>
            ))}
          </div>
        </Block>

        <Block title="Ridgeline dividers">
          <div className="max-w-md space-y-6">
            {ridgelineTokens.map((r) => (
              <div key={r.label} className="space-y-2">
                <div className={`h-px w-full ${r.className}`} />
                <Label swatch={r} />
              </div>
            ))}
          </div>
          <div className="max-w-md space-y-2 pt-4">
            <Ridgeline />
            <p className="font-mono text-text-secondary text-xs">
              The composed signature divider — gold-6 with an amber-9 glow at one point
            </p>
          </div>
        </Block>

        <Block title="Solid backgrounds">
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
        </Block>

        <Block title="Text">
          <div className="space-y-3">
            {textTokens.map((t) => (
              <div key={t.label} className="flex items-baseline gap-4">
                <span className={`font-body text-lg ${t.className}`}>The quick brown fox</span>
                <Label swatch={t} />
              </div>
            ))}
          </div>
        </Block>

        <Block title="Overlay & focus ring">
          <div className="flex flex-wrap items-center gap-8">
            <div className="space-y-2">
              <div className="bg-overlay h-16 w-32 rounded-control" />
              <Label swatch={{ label: "overlay", cssVar: "--overlay", className: "bg-overlay" }} />
            </div>
            <div className="space-y-2">
              <div className="bg-component ring-focus-ring ring-offset-app-bg h-16 w-32 rounded-control ring-2 ring-offset-2" />
              <Label swatch={{ label: "focus-ring", cssVar: "--focus-ring", className: "ring-focus-ring" }} />
            </div>
          </div>
        </Block>

        <Block title="Scrim">
          <div className="scrim bg-component-accent relative h-40 w-64 rounded-control">
            <p className="text-text-primary absolute right-3 bottom-3 left-3 font-mono text-xs uppercase">
              Type over photograph
            </p>
          </div>
        </Block>

        <Block title="Type scale — Phase 12c, tuned to Fraunces">
          <div className="space-y-6">
            {(["xl", "lg", "md", "sm"] as const).map((size) => (
              <div key={size}>
                <Eyebrow>{`Display / ${size}`}</Eyebrow>
                <Display size={size}>Scaling new heights in cinematic storytelling.</Display>
              </div>
            ))}
            <div className="space-y-2">
              <Eyebrow>Eyebrow — accent (default) / secondary / primary</Eyebrow>
              <div className="flex flex-wrap gap-4">
                <Eyebrow>Portfolio</Eyebrow>
                <Eyebrow tone="secondary">Portfolio</Eyebrow>
                <Eyebrow tone="primary">Portfolio</Eyebrow>
              </div>
            </div>
            <div>
              <Eyebrow>Lead</Eyebrow>
              <Lead className="max-w-prose">
                Weddings, commercial work, portraits, or ministry film — tell us what
                you&rsquo;re planning.
              </Lead>
            </div>
            <div>
              <Eyebrow>Body</Eyebrow>
              <Body className="max-w-prose">
                Oros Productions is a photography and videography studio working across weddings,
                commercial work, portraiture, and ministry film.
              </Body>
            </div>
            <div>
              <Eyebrow>Body / sm</Eyebrow>
              <Body size="sm" className="max-w-prose">
                Oros Productions is a photography and videography studio working across weddings,
                commercial work, portraiture, and ministry film.
              </Body>
            </div>
            <div>
              <Eyebrow>Label — the mono metadata line</Eyebrow>
              <p className="text-text-accent font-mono text-xs tracking-widest uppercase">
                NIKON Z8 · 85MM · ƒ1.4 · 1/200
              </p>
            </div>
          </div>
        </Block>

        <Block title="Container">
          <div className="border-border border">
            <Container className="border-border border-x border-dashed py-4">
              <p className="font-mono text-text-secondary text-xs">max-w-6xl, this content column</p>
            </Container>
          </div>
        </Block>

        <Block title="shadcn + Base UI bridge">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </Block>
      </Container>
    </div>
  );
}

/** A titled block for this page's own layout — not the Section primitive. */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section className="space-y-4 py-0">
      <Eyebrow as="h2" className="text-sm">
        {title}
      </Eyebrow>
      {children}
    </Section>
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
    <p className="font-mono text-text-secondary text-xs">
      <span className="block">{swatch.label}</span>
      <span className="block">{swatch.cssVar}</span>
    </p>
  );
}
