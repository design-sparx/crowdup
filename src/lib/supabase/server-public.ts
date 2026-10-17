import {createClient} from "@supabase/supabase-js";

/**
 * Anonymous, cookie-less Supabase client for server-side reads of public data.
 * Row level security limits it to what any visitor may see (e.g. live campaigns).
 * To be unified with the auth-aware server client later.
 */
export function createPublicClient() {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
        throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set (see .env.example)");
    }
    return createClient(url, anonKey, {auth: {persistSession: false, autoRefreshToken: false}});
}
