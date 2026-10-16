type Env = Record<string, string | undefined>;

export type StripeKeyMode = "test" | "live" | "unknown";
export type DemoBannerState = "hidden" | "demo" | "live-key-warning";

/** DEMO_MODE is off unless it is exactly "true" or "1" (case-insensitive). */
export function isDemoMode(env: Env): boolean {
    return ["true", "1"].includes((env.DEMO_MODE ?? "").trim().toLowerCase());
}

/** Derives Stripe's mode from the secret (or restricted) key prefix. */
export function stripeKeyMode(key: string | undefined): StripeKeyMode {
    const k = (key ?? "").trim();
    if (/^(sk|rk)_test_/.test(k)) return "test";
    if (/^(sk|rk)_live_/.test(k)) return "live";
    return "unknown";
}

/**
 * What the site-wide banner should show. The demo banner promises test mode, so it is only
 * returned when the key is positively a test key; anything else in demo mode is a warning.
 */
export function demoBannerState(env: Env): DemoBannerState {
    if (!isDemoMode(env)) return "hidden";
    return stripeKeyMode(env.STRIPE_SECRET_KEY) === "test" ? "demo" : "live-key-warning";
}
