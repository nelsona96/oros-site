/**
 * The site's one signature mark (docs/DESIGN.md §3) — a minimal two-peak
 * summit line. Uses currentColor so it inherits whatever text token wraps
 * it (e.g. className="text-text-primary" or "text-text-accent").
 */
export function RidgelineMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 28 L14 10 L20 18 L34 4 L46 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
