import type {SupabaseClient} from "@supabase/supabase-js";
import {mapModerationError} from "../../lib/moderation/moderation";

/**
 * Admin moderation reads and actions. Callers must already have passed getAdminContext.
 * Actions call SECURITY DEFINER SQL functions that re-check is_admin() and write the
 * audit row in the same transaction; nothing here trusts a client-supplied flag.
 */

export interface AdminCampaignRow {
    id: string;
    slug: string;
    title: string;
    status: string;
    suspendedReason: string | null;
}

export interface AdminUserRow {
    id: string;
    displayName: string;
    role: string;
    suspended: boolean;
    suspendedReason: string | null;
}

export type ActionResult = {ok: true} | {ok: false; error: string; status: number};

function fail(error: {message: string}): never {
    throw new Error(error.message);
}

export async function listAdminCampaigns(supabase: SupabaseClient): Promise<AdminCampaignRow[]> {
    const {data, error} = await supabase
        .from("campaign")
        .select("id, slug, title, status, suspended_reason")
        .neq("status", "draft")
        .order("created_at", {ascending: false})
        .limit(200);
    if (error) fail(error);
    return (data ?? []).map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        status: r.status,
        suspendedReason: r.suspended_reason,
    }));
}

export async function listAdminUsers(supabase: SupabaseClient): Promise<AdminUserRow[]> {
    const {data, error} = await supabase
        .from("profile")
        .select("id, display_name, role, suspended, suspended_reason")
        .order("created_at", {ascending: false})
        .limit(200);
    if (error) fail(error);
    return (data ?? []).map((r) => ({
        id: r.id,
        displayName: r.display_name,
        role: r.role,
        suspended: r.suspended,
        suspendedReason: r.suspended_reason,
    }));
}

async function call(supabase: SupabaseClient, fn: string, args: Record<string, unknown>): Promise<ActionResult> {
    const {error} = await supabase.rpc(fn, args);
    if (!error) return {ok: true};
    return {ok: false, error: mapModerationError(error.code), status: error.code === "42501" ? 403 : 400};
}

export const suspendCampaign = (s: SupabaseClient, id: string, reason: string) =>
    call(s, "admin_suspend_campaign", {p_campaign_id: id, p_reason: reason});
export const restoreCampaign = (s: SupabaseClient, id: string) =>
    call(s, "admin_restore_campaign", {p_campaign_id: id});
export const suspendUser = (s: SupabaseClient, id: string, reason: string) =>
    call(s, "admin_suspend_user", {p_user_id: id, p_reason: reason});
export const unsuspendUser = (s: SupabaseClient, id: string) =>
    call(s, "admin_unsuspend_user", {p_user_id: id});

/** The signed-in user's own suspension state, for messages on the organiser pages. */
export async function getOwnSuspension(
    supabase: SupabaseClient,
    userId: string,
): Promise<{suspended: boolean; reason: string | null}> {
    const {data} = await supabase
        .from("profile")
        .select("suspended, suspended_reason")
        .eq("id", userId)
        .maybeSingle();
    return {suspended: data?.suspended === true, reason: data?.suspended_reason ?? null};
}
