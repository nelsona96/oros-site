export default function Loading() {
  return (
    <div role="status" className="flex min-h-[60vh] items-center justify-center">
      <div className="border-text-secondary/30 border-t-text-accent h-8 w-8 animate-spin rounded-full border-2" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
