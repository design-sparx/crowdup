import type {SupabaseClient} from "@supabase/supabase-js";
import {parsePublishingMode, type PublishingMode} from "../../lib/stripe/publishing";
import {onboardingStatus, pickCampaignCurrency, type OnboardingStatus} from "../../lib/stripe/onboarding";
import {publishOwnDraft, startOnboarding, syncAccountStatus, type SyncResult} from "./connect";
import {supabaseConnectStore} from "./connectStore.server";
import {createServiceRoleClient} from "./serviceRole.server";
import {createStripeConnectApi} from "./stripe.server";

/** Wires the injected Connect logic to real Stripe and the service-role database. */

export function getPublishingMode(): PublishingMode {
    return parsePublishingMode(process.env.PUBLISHING_MODE);
}

/** Public origin for Stripe redirect URLs. Only SITE_URL is trusted outside development. */
function siteUrl(request: Request): string {
    const configured = process.env.SITE_URL?.trim().replace(/\/+$/, "");
    if (configured) return configured;
    if (process.env.NODE_ENV === "production") throw new Error("SITE_URL must be set in production (see .env.example)");
    return new URL(request.url).origin;
}

export function onboardingUrls(request: Request) {
    const base = siteUrl(request);
    return {returnUrl: `${base}/stripe/return`, refreshUrl: `${base}/stripe/refresh`};
}

export function beginOnboarding(request: Request, user: {id: string; email?: string | null}): Promise<string> {
    return startOnboarding({
        api: createStripeConnectApi(),
        store: supabaseConnectStore(createServiceRoleClient()),
        userId: user.id,
        email: user.email ?? null,
        ...onboardingUrls(request),
    });
}

export function refreshOnboarding(userId: string): Promise<SyncResult> {
    return syncAccountStatus({
        api: createStripeConnectApi(),
        store: supabaseConnectStore(createServiceRoleClient()),
        userId,
        mode: getPublishingMode(),
    });
}

export interface ConnectSummary {
    status: OnboardingStatus;
    currency: string | null;
}

/** Reads the stored (last synced) onboarding state through the user's own RLS-bound client. */
export async function readConnectSummary(supabase: SupabaseClient, userId: string): Promise<ConnectSummary> {
    const {data, error} = await supabase
        .from("profile")
        .select("stripe_account_id, stripe_onboarding_complete, stripe_currency")
        .eq("id", userId)
        .maybeSingle();
    if (error) throw new Error(error.message);
    const complete = Boolean(data?.stripe_onboarding_complete);
    return {
        status: onboardingStatus({accountId: (data?.stripe_account_id as string | null) ?? null, complete}),
        currency: pickCampaignCurrency({complete, currency: (data?.stripe_currency as string | null) ?? null}),
    };
}

/** Publishes an owner's draft from the last synced state. The owner id comes from the session. */
export function publishDraft(userId: string, campaignId: string) {
    return publishOwnDraft({
        store: supabaseConnectStore(createServiceRoleClient()),
        userId,
        campaignId,
        mode: getPublishingMode(),
    });
}
