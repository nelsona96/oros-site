/** A ring-only spinner, not another lucide icon — DESIGN.md §6 enumerates the whole site's icon set and this isn't in it. */
export function Spinner({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="border-text-secondary/30 border-t-text-accent h-8 w-8 animate-spin rounded-full border-2" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
