/**
 * The signature section divider (docs/DESIGN.md §3): a gold-6 hairline
 * carrying a brief amber-9 glow at one point — light catching a spot on a
 * ridge. `position` (0-100) lets different usages vary where the light
 * falls, so repeated dividers down a page don't look mechanically identical.
 */
export function Ridgeline({
  position = 35,
  className,
}: {
  position?: number;
  className?: string;
}) {
  const spread = 8;
  const from = Math.max(0, position - spread);
  const to = Math.min(100, position + spread);

  return (
    <div
      role="separator"
      className={`h-px w-full ${className ?? ""}`}
      style={{
        backgroundImage: `linear-gradient(to right,
          var(--rule-ridgeline) 0%,
          var(--rule-ridgeline) ${from}%,
          var(--light-solid) ${position}%,
          var(--rule-ridgeline) ${to}%,
          var(--rule-ridgeline) 100%)`,
      }}
    />
  );
}
