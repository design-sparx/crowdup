export type AuthConfig = {
    supabaseUrl: string;
    supabaseAnonKey: string;
    googleEnabled: boolean;
    siteUrl: string | null;
};

type Env = Record<string, string | undefined>;

/**
 * Parses server environment variables into the auth config. Throws a readable error when
 * a required variable is missing so misconfiguration fails loudly instead of at sign-in.
 */
export function parseAuthConfig(env: Env): AuthConfig {
    const supabaseUrl = env.SUPABASE_URL?.trim();
    const supabaseAnonKey = env.SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl) throw new Error("SUPABASE_URL is not set (see .env.example)");
    if (!supabaseAnonKey) throw new Error("SUPABASE_ANON_KEY is not set (see .env.example)");

    return {
        supabaseUrl,
        supabaseAnonKey,
        googleEnabled: ["true", "1"].includes((env.AUTH_GOOGLE_ENABLED ?? "").trim().toLowerCase()),
        siteUrl: env.SITE_URL?.trim().replace(/\/+$/, "") || null,
    };
}
