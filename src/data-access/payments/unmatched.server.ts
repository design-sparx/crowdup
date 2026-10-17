import type {SupabaseClient} from "@supabase/supabase-js";

/**
 * Unmatched payments: paid Stripe sessions the webhook could not tie to a campaign. Callers
 * must already have passed getAdminContext; RLS also limits these rows to admins, so a
 * mistake here still cannot leak or change them for anyone else.
 */

export interface UnmatchedPayment {
    id: string;
    createdAt: string;
    amount: number;
    currency: string;
    reason: string;
    accountId: string;
    campaignId: string | null;
    eventId: string;
    sessionId: string | null;
    paymentIntentId: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listOpenUnmatched(supabase: SupabaseClient): Promise<UnmatchedPayment[]> {
    const {data, error} = await supabase
        .from("unmatched_payment")
        .select(
            "id, created_at, amount, currency, reason, stripe_account_id, campaign_id, stripe_event_id, stripe_checkout_session_id, stripe_payment_intent_id",
        )
        .is("resolved_at", null)
        .order("created_at", {ascending: true})
        .limit(200);
    if (error) throw new Error("Could not load unmatched payments");
    return (data ?? []).map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        amount: Number(r.amount),
        currency: r.currency,
        reason: r.reason,
        accountId: r.stripe_account_id,
        campaignId: r.campaign_id,
        eventId: r.stripe_event_id,
        sessionId: r.stripe_checkout_session_id,
        paymentIntentId: r.stripe_payment_intent_id,
    }));
}

export async function countOpenUnmatched(supabase: SupabaseClient): Promise<number> {
    const {count, error} = await supabase
        .from("unmatched_payment")
        .select("id", {count: "exact", head: true})
        .is("resolved_at", null);
    if (error) throw new Error("Could not count unmatched payments");
    return count ?? 0;
}

/** Marks one payment as reviewed (refunded or reconciled in Stripe by the operator). */
export async function resolveUnmatched(
    supabase: SupabaseClient,
    id: string,
): Promise<"resolved" | "not_found" | "invalid"> {
    if (!UUID.test(id)) return "invalid";
    const {data, error} = await supabase
        .from("unmatched_payment")
        .update({resolved_at: new Date().toISOString()})
        .eq("id", id)
        .is("resolved_at", null)
        .select("id");
    if (error) throw new Error("Could not update the payment");
    return (data ?? []).length > 0 ? "resolved" : "not_found";
}
