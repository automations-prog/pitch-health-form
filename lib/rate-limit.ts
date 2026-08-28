// Lightweight in-memory rate limiter to deter spam submissions.
//
// Caveat: this state lives in the Node.js process running the function.
// Vercel Fluid Compute reuses warm instances across requests, so this works
// well in practice for a single deployment, but it is NOT a durable/shared
// limit — a cold start clears it, and a burst of traffic across many
// concurrent instances can each get their own independent counter. For a
// hard guarantee under real scale, replace this with a shared store (e.g.
// Upstash Redis via the Vercel Marketplace).

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

const MAX_TRACKED_KEYS = 5000;

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    buckets.set(key, bucket);
    return { allowed: false, retryAfterMs: windowMs - (now - oldest) };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  // Basic unbounded-growth guard: drop the oldest-touched entries if the map
  // gets too large (e.g. long-running instance under heavy varied traffic).
  if (buckets.size > MAX_TRACKED_KEYS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  }

  return { allowed: true, retryAfterMs: 0 };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
