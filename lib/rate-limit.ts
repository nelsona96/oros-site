const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 3;

/**
 * Basic per-IP throttle for /api/contact (SPEC.md §5) — an in-memory sliding
 * window, not a distributed store. Good enough to blunt a naive bot loop;
 * it resets on cold start and isn't shared across serverless instances, so
 * it's not a real ceiling under load. A durable limiter (Upstash, etc.)
 * would be the upgrade if abuse turns out to be a real problem in practice.
 */
const requestLog = new Map<string, number[]>();

export function isRateLimited(ip: string, now = Date.now()): boolean {
  const recent = (requestLog.get(ip) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}
