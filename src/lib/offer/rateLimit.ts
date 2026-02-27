/**
 * IP-based in-memory rate limiter
 * Limits submissions per IP to prevent abuse on public endpoints
 */

interface RateLimitEntry {
    count: number;
    firstRequest: number;
}

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

// In-memory store (resets on server restart)
const ipStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipStore.entries()) {
        if (now - entry.firstRequest > WINDOW_MS) {
            ipStore.delete(ip);
        }
    }
}, 10 * 60 * 1000);

export function checkRateLimit(ip: string): {
    success: boolean;
    remaining: number;
    resetAt: number;
} {
    const now = Date.now();
    const entry = ipStore.get(ip);

    // No existing entry — allow
    if (!entry || now - entry.firstRequest > WINDOW_MS) {
        ipStore.set(ip, { count: 1, firstRequest: now });
        return {
            success: true,
            remaining: MAX_REQUESTS - 1,
            resetAt: now + WINDOW_MS,
        };
    }

    // Within window — check count
    if (entry.count >= MAX_REQUESTS) {
        return {
            success: false,
            remaining: 0,
            resetAt: entry.firstRequest + WINDOW_MS,
        };
    }

    // Increment
    entry.count++;
    return {
        success: true,
        remaining: MAX_REQUESTS - entry.count,
        resetAt: entry.firstRequest + WINDOW_MS,
    };
}
