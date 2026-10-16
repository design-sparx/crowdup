export interface RateLimiterOptions {
    /** Maximum accepted hits per key within the window. */
    limit: number;
    windowMs: number;
    now?: () => number;
}

/**
 * Sliding-window limiter held in memory. Rejected attempts are not recorded, so a blocked
 * client is allowed again as soon as its oldest accepted hit leaves the window.
 */
export function createRateLimiter({limit, windowMs, now = Date.now}: RateLimiterOptions) {
    const hits = new Map<string, number[]>();

    return {
        /** Records a hit and returns true, or returns false when the key is over the limit. */
        take(key: string): boolean {
            const t = now();
            const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
            if (recent.length >= limit) {
                hits.set(key, recent);
                return false;
            }
            recent.push(t);
            hits.set(key, recent);
            if (hits.size > 10_000) {
                for (const [k, v] of hits) {
                    if (v.every((at) => t - at >= windowMs)) hits.delete(k);
                }
            }
            return true;
        },
    };
}
