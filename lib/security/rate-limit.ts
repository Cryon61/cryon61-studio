/**
 * Fixed-window in-memory rate limiter.
 * NOTE: state is per-process. For multi-instance deployments, swap the Map
 * for Redis behind the same `rateLimit` signature.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  b.count += 1;
  const allowed = b.count <= limit;
  return { allowed, remaining: Math.max(0, limit - b.count), retryAfterSec: allowed ? 0 : Math.ceil((b.resetAt - now) / 1000) };
}

if (typeof setInterval !== "undefined") {
  const t = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }, 60_000);
  (t as unknown as { unref?: () => void }).unref?.();
}
