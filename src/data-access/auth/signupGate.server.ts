import {parseAuthConfig} from "./authConfig";
import {signupGateMismatch} from "./signupGate";

const TTL_MS = 5 * 60 * 1000;
let cached: {at: number; warning: string | null} | null = null;

/**
 * Reads Supabase Auth's public settings and returns a warning when the app has signup off
 * but Supabase would still create accounts directly (the app flag only hides our own pages).
 * Never throws: an unreachable or unexpected response yields no warning. Cached for 5 minutes.
 */
export async function getSignupGateWarning(env: Record<string, string | undefined> = process.env): Promise<string | null> {
    if (cached && Date.now() - cached.at < TTL_MS) return cached.warning;
    let warning: string | null = null;
    try {
        const config = parseAuthConfig(env);
        if (!config.signupEnabled) {
            const res = await fetch(`${config.supabaseUrl}/auth/v1/settings`, {
                headers: {apikey: config.supabaseAnonKey},
                signal: AbortSignal.timeout(3000),
            });
            if (res.ok) warning = signupGateMismatch(config.signupEnabled, await res.json());
        }
    } catch {
        warning = null;
    }
    if (warning) console.error(`[auth] ${warning}`);
    cached = {at: Date.now(), warning};
    return warning;
}
