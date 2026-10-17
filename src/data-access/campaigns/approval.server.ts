import type {SupabaseClient} from "@supabase/supabase-js";
import type {PendingCampaign} from "../../lib/campaigns/pending";
import {parseRejectionReason} from "../../lib/campaigns/transitions";

/**
 * Admin approval queue. Always called with the admin's cookie-bound client (never the
 * service role): reads go through RLS (campaign_select_admin) and decisions through the
 * SECURITY DEFINER functions approve_campaign / reject_campaign, which re-check is_admin()
 * in the database. The route-level admin check is a second layer, not the only one.
 */

interface Row {
    id: string;
    slug: string;
    title: string;
    category: string;
    country: string;
    description: string;
    goal_amount: number;
    currency: string | null;
    created_at: string;
    owner: {display_name: string} | null;
}

export async function listPendingCampaigns(client: SupabaseClient): Promise<PendingCampaign[]> {
    const {data, error} = await client
        .from("campaign")
        .select("id, slug, title, category, country, description, goal_amount, currency, created_at, owner:owner_id(display_name)")
        .eq("status", "pending_approval")
        .order("created_at", {ascending: true});
    if (error) throw new Error("Could not load pending campaigns");
    return ((data ?? []) as unknown as Row[]).map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        category: r.category,
        country: r.country,
        description: r.description,
        goalAmount: Number(r.goal_amount),
        currency: r.currency,
        createdAt: r.created_at,
        organizerName: r.owner?.display_name || "Unknown organiser",
    }));
}

export async function countPendingCampaigns(client: SupabaseClient): Promise<number> {
    const {count, error} = await client
        .from("campaign")
        .select("id", {count: "exact", head: true})
        .eq("status", "pending_approval");
    if (error) throw new Error("Could not count pending campaigns");
    return count ?? 0;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type DecisionResult = {ok: true; message: string} | {ok: false; error: string; status: number};

/** Validates the submitted form and applies the decision through the database function. */
export async function decideCampaign(client: SupabaseClient, form: FormData): Promise<DecisionResult> {
    const id = form.get("campaignId");
    if (typeof id !== "string" || !UUID.test(id)) return {ok: false, error: "Unknown campaign.", status: 400};
    const intent = form.get("intent");

    let error: {code?: string; message?: string} | null;
    if (intent === "approve") {
        ({error} = await client.rpc("approve_campaign", {p_campaign_id: id}));
    } else if (intent === "reject") {
        const parsed = parseRejectionReason(form.get("reason"));
        if (!parsed.ok) return {ok: false, error: parsed.error, status: 400};
        ({error} = await client.rpc("reject_campaign", {p_campaign_id: id, p_reason: parsed.reason}));
    } else {
        return {ok: false, error: "Unknown action.", status: 400};
    }
    if (error?.code === "P0002") return {ok: false, error: "This campaign is no longer pending.", status: 409};
    // approve_campaign refuses when the organiser cannot take donations; its message is written for admins.
    if (error?.code === "P0001" && error.message) {
        return {ok: false, error: `${error.message.charAt(0).toUpperCase()}${error.message.slice(1)}.`, status: 409};
    }
    if (error?.code === "42501") return {ok: false, error: "Not allowed.", status: 403};
    if (error) return {ok: false, error: "Could not save the decision.", status: 500};
    return {ok: true, message: intent === "approve" ? "Campaign approved and live." : "Campaign rejected."};
}
