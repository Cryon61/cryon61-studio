import { ApiError } from "@/lib/utils/api";
import { rateLimit } from "./rate-limit";

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

/** CSRF defense for cookie-authenticated mutations: Origin must match Host. */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let originHost = "";
  try { originHost = new URL(origin).host; } catch { /* invalid */ }
  if (!host || originHost !== host) throw new ApiError("CSRF_FAILED", "Invalid request origin", 403);
}

export function enforceRateLimit(req: Request, bucket: string, limit: number, windowMs: number, extraKey = "") {
  const r = rateLimit(`${bucket}:${clientIp(req)}:${extraKey}`, limit, windowMs);
  if (!r.allowed) throw new ApiError("RATE_LIMITED", `Too many requests. Retry in ${r.retryAfterSec}s`, 429);
}
