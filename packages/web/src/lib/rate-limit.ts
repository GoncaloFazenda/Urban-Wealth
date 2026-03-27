/**
 * In-memory rate limiter using sliding window.
 * Each key (e.g. IP address or userId) has a list of timestamps.
 * Requests older than the window are pruned on each check.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(
      (t) => now - t < 60 * 60 * 1000
    );
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number | null;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Prune old timestamps outside the window
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < config.windowMs
  );

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0]!;
    const retryAfterMs = config.windowMs - (now - oldestInWindow);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    };
  }

  // Record this request
  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterMs: null,
  };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

/** For testing only */
export function clearAllRateLimits(): void {
  store.clear();
}
