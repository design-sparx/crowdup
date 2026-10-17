import type {SupabaseClient} from "@supabase/supabase-js";
import {goalAtGoLive} from "../../lib/campaigns/goal";
import type {ConnectStore} from "./connect";

function fail(error: {message: string}): never {
    throw new Error(error.message);
}

/** ConnectStore backed by the service-role client. Every query is scoped to one owner. */
export function supabaseConnectStore(db: SupabaseClient): ConnectStore {
    /**
     * Fixes the currency and converts a never-priced draft's provisional goal (hundredths)
     * into that currency's minor units in the same update. A reopened rejected campaign
     * already has a currency, so its goal is kept. The goal filter makes a concurrent edit
     * lose the race instead of the goal being rescaled twice.
     */
    async function moveDraft(campaignId: string, currency: string, patch: Record<string, unknown>) {
        const {data: draft, error: readError} = await db
            .from("campaign")
            .select("goal_amount, currency")
            .eq("id", campaignId)
            .eq("status", "draft")
            .maybeSingle();
        if (readError) fail(readError);
        if (!draft) return false;
        const row = draft as {goal_amount: number; currency: string | null};
        const goal = Number(row.goal_amount);
        const {data, error} = await db
            .from("campaign")
            .update({...patch, currency, goal_amount: goalAtGoLive({goal, currentCurrency: row.currency}, currency)})
            .eq("id", campaignId)
            .eq("status", "draft")
            .eq("goal_amount", goal)
            .select("id");
        if (error) fail(error);
        return (data ?? []).length > 0;
    }

    return {
        async getProfile(userId) {
            const {data, error} = await db
                .from("profile")
                .select("stripe_account_id, suspended, stripe_onboarding_complete, stripe_currency")
                .eq("id", userId)
                .maybeSingle();
            if (error) fail(error);
            if (!data) return null;
            return {
                stripeAccountId: data.stripe_account_id as string | null,
                suspended: data.suspended as boolean,
                onboardingComplete: Boolean(data.stripe_onboarding_complete),
                currency: (data.stripe_currency as string | null) ?? null,
            };
        },
        async findUserByAccountId(accountId) {
            const {data, error} = await db.from("profile").select("id").eq("stripe_account_id", accountId).maybeSingle();
            if (error) fail(error);
            return (data?.id as string | undefined) ?? null;
        },
        async saveAccountId(userId, accountId) {
            const {data, error} = await db
                .from("profile")
                .update({stripe_account_id: accountId})
                .eq("id", userId)
                .is("stripe_account_id", null)
                .select("id");
            if (error) fail(error);
            return (data ?? []).length > 0;
        },
        async saveStatus(userId, {complete, currency}) {
            const {error} = await db
                .from("profile")
                .update({stripe_onboarding_complete: complete, stripe_currency: currency})
                .eq("id", userId);
            if (error) fail(error);
        },
        async listDrafts(ownerId) {
            const {data, error} = await db.from("campaign").select("id").eq("owner_id", ownerId).eq("status", "draft");
            if (error) fail(error);
            return (data ?? []) as {id: string}[];
        },
        async publish(campaignId, currency) {
            // The status filter makes this idempotent and race-safe: only a draft can go live.
            return moveDraft(campaignId, currency, {status: "live", published_at: new Date().toISOString()});
        },
        async submitForApproval(campaignId, currency) {
            // Same race-safe shape as publish: only a draft can be submitted.
            return moveDraft(campaignId, currency, {status: "pending_approval"});
        },
    };
}
