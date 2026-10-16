import {createClient, type SupabaseClient} from "@supabase/supabase-js";

/**
 * Service-role Supabase client. It BYPASSES row-level security, so:
 * - it lives in a `.server` module and must only be imported from loaders, actions and
 *   resource routes, never from components;
 * - callers must derive the user id from the verified session (or a verified Stripe
 *   event), never from request input;
 * - keep each use narrow and named (see supabaseConnectStore).
 */
let cached: SupabaseClient | undefined;

export function createServiceRoleClient(): SupabaseClient {
    if (cached) return cached;
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url) throw new Error("SUPABASE_URL is not set (see .env.example)");
    if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (see .env.example)");
    return (cached = createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}}));
}
