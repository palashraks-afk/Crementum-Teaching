import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/**
 * Per-process sliding window. Enough to stop a bored student mashing submit or
 * a naive bot; a multi-instance deployment should move this to the database or
 * an edge rate limiter.
 */
export function allow(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= MAX_PER_WINDOW) return false;

  bucket.count += 1;
  return true;
}

/** Drops expired buckets so the map cannot grow without bound. */
export function sweep(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}
