/**
 * Simple in-memory rate limiting utility
 * For production, consider using Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory store - in production use Redis
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }
    },
    5 * 60 * 1000
  );
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// Default rate limits
export const RATE_LIMITS = {
  // Strict limits for auth endpoints
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 minutes
  // Medium limits for API
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 per minute
  // Lenient for general usage
  general: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
  // Very strict for webhooks
  webhook: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
} as const;

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.general
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}:${config.windowMs}`;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // First request or window expired
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: Math.ceil(resetTime / 1000),
    };
  }

  // Increment count
  entry.count += 1;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = entry.count <= config.maxRequests;

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: Math.ceil(entry.resetTime / 1000),
  };
}

/**
 * Create a rate limit response for Next.js
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
        "Retry-After": String(Math.max(0, result.reset - Math.ceil(Date.now() / 1000))),
      },
    }
  );
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}
