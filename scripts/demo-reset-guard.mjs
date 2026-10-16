// Pure safety guard for scripts/demo-reset.mjs. No I/O, so it is unit tested.

/** Extracts the Supabase project ref from a hosted Postgres URL, or null. */
export function projectRefFromDatabaseUrl(url) {
    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return null;
    }
    // Direct connection: db.<ref>.supabase.co
    const host = /^db\.([a-z0-9]{20})\.supabase\.co$/.exec(parsed.hostname);
    if (host) return host[1];
    // Pooler connection: the user is postgres.<ref>
    const user = /^postgres\.([a-z0-9]{20})$/.exec(decodeURIComponent(parsed.username));
    if (user && /\.pooler\.supabase\.com$/.test(parsed.hostname)) return user[1];
    return null;
}

/**
 * Decides whether the reset may run. Refuses unless the target is a hosted Supabase project
 * whose ref equals DEMO_RESET_CONFIRM_PROJECT_REF. Localhost and unknown hosts are refused.
 * Returns {ok: true, ref} or {ok: false, reason}.
 */
export function checkResetGuard(env) {
    const url = (env.DEMO_DATABASE_URL ?? "").trim();
    const confirm = (env.DEMO_RESET_CONFIRM_PROJECT_REF ?? "").trim();
    if (!url) return {ok: false, reason: "DEMO_DATABASE_URL is not set"};
    if (!confirm) return {ok: false, reason: "DEMO_RESET_CONFIRM_PROJECT_REF is not set"};
    const ref = projectRefFromDatabaseUrl(url);
    if (!ref) return {ok: false, reason: "DEMO_DATABASE_URL is not a hosted Supabase database URL"};
    if (ref !== confirm) {
        return {ok: false, reason: "project ref in DEMO_DATABASE_URL does not match DEMO_RESET_CONFIRM_PROJECT_REF"};
    }
    return {ok: true, ref};
}
