import {
    accountCurrency,
    isOnboardingComplete,
    onboardingStatus,
    pickCampaignCurrency,
    type OnboardingStatus,
    type StripeAccountState,
} from "../../lib/stripe/onboarding";
import {goLiveDecision, type PublishingMode} from "../../lib/stripe/publishing";

/**
 * Stripe Connect (Standard) onboarding logic. Stripe and the database are injected so the
 * flow is unit-testable with fakes; the real implementations live in the *.server.ts files.
 */

export interface StripeConnectApi {
    createAccount(p: {email: string | null; userId: string}): Promise<{id: string}>;
    createAccountLink(p: {account: string; returnUrl: string; refreshUrl: string}): Promise<{url: string}>;
    retrieveAccount(id: string): Promise<StripeAccountState & {id: string}>;
}

export interface ConnectStore {
    getProfile(userId: string): Promise<{
        stripeAccountId: string | null;
        suspended: boolean;
        onboardingComplete: boolean;
        currency: string | null;
    } | null>;
    /** Owner of a connected Stripe account, for webhooks. */
    findUserByAccountId(accountId: string): Promise<string | null>;
    /** Sets the account id only if none is stored yet. Returns false when one already was. */
    saveAccountId(userId: string, accountId: string): Promise<boolean>;
    saveStatus(userId: string, status: {complete: boolean; currency: string | null}): Promise<void>;
    listDrafts(ownerId: string): Promise<{id: string}[]>;
    /**
     * Moves a draft to live and fixes its currency. "gone" means it was no longer a draft;
     * "bad_goal" means its goal cannot be expressed in the currency, so nothing was changed.
     */
    publish(campaignId: string, currency: string): Promise<MoveResult>;
    /** Moves a draft to pending_approval and fixes its currency. Results as for publish. */
    submitForApproval(campaignId: string, currency: string): Promise<MoveResult>;
}

export type MoveResult = true | "gone" | "bad_goal";

/** Returns the Stripe-hosted onboarding URL, creating the connected account on first use. */
export async function startOnboarding(p: {
    api: StripeConnectApi;
    store: ConnectStore;
    userId: string;
    email: string | null;
    returnUrl: string;
    refreshUrl: string;
}): Promise<string> {
    const profile = await p.store.getProfile(p.userId);
    if (!profile) throw new Error("Profile not found");
    if (profile.suspended) throw new Error("Your account is suspended");

    let accountId = profile.stripeAccountId;
    if (!accountId) {
        const created = await p.api.createAccount({email: p.email, userId: p.userId});
        if (await p.store.saveAccountId(p.userId, created.id)) {
            accountId = created.id;
        } else {
            // Lost a race with a concurrent request; use the account that won. The extra
            // Stripe account is empty and harmless.
            accountId = (await p.store.getProfile(p.userId))?.stripeAccountId ?? created.id;
        }
    }
    const link = await p.api.createAccountLink({account: accountId, returnUrl: p.returnUrl, refreshUrl: p.refreshUrl});
    return link.url;
}

export interface SyncResult {
    status: OnboardingStatus;
    currency: string | null;
    published: number;
    /** Drafts moved to pending_approval (approval mode). */
    submitted: number;
}

/**
 * Pulls the account state from Stripe (never trusts the redirect), stores status and
 * currency on the profile, and goes live with the organiser's drafts when allowed.
 */
export async function syncAccountStatus(p: {
    api: StripeConnectApi;
    store: ConnectStore;
    userId: string;
    mode: PublishingMode;
}): Promise<SyncResult> {
    const profile = await p.store.getProfile(p.userId);
    if (!profile?.stripeAccountId) return {status: "not_started", currency: null, published: 0, submitted: 0};

    const account = await p.api.retrieveAccount(profile.stripeAccountId);
    const complete = isOnboardingComplete(account);
    const currency = accountCurrency(account.defaultCurrency);
    await p.store.saveStatus(p.userId, {complete, currency});

    let published = 0;
    let submitted = 0;
    if (complete && currency) {
        for (const draft of await p.store.listDrafts(p.userId)) {
            const decision = goLiveDecision({
                onboardingComplete: complete,
                mode: p.mode,
                campaignStatus: "draft",
                ownerSuspended: profile.suspended,
            });
            // A draft whose goal does not fit the currency stays a draft; the organiser's next
            // manual publish reports bad_goal so they can fix it.
            if (decision === "go_live" && (await p.store.publish(draft.id, currency)) === true) published++;
            if (decision === "await_approval" && (await p.store.submitForApproval(draft.id, currency)) === true) submitted++;
        }
    }
    return {status: onboardingStatus({accountId: profile.stripeAccountId, complete}), currency, published, submitted};
}

export type PublishResult = "live" | "awaiting_approval" | "not_connected" | "not_found" | "bad_goal";

/**
 * Publishes one of the organiser's drafts from the last synced onboarding state (no Stripe
 * call). Used when the organiser is already connected before the draft is ready.
 */
export async function publishOwnDraft(p: {
    store: ConnectStore;
    userId: string;
    campaignId: string;
    mode: PublishingMode;
}): Promise<PublishResult> {
    const profile = await p.store.getProfile(p.userId);
    if (!profile) return "not_found";
    const currency = pickCampaignCurrency({complete: profile.onboardingComplete, currency: profile.currency});
    if (!currency) return "not_connected";
    // Ownership: only ids from the owner's own draft list can be published.
    if (!(await p.store.listDrafts(p.userId)).some((d) => d.id === p.campaignId)) return "not_found";
    const decision = goLiveDecision({
        onboardingComplete: true,
        mode: p.mode,
        campaignStatus: "draft",
        ownerSuspended: profile.suspended,
    });
    if (decision === "none") return "not_found";
    if (decision === "await_approval") {
        const moved = await p.store.submitForApproval(p.campaignId, currency);
        return moved === true ? "awaiting_approval" : moved === "bad_goal" ? "bad_goal" : "not_found";
    }
    const moved = await p.store.publish(p.campaignId, currency);
    return moved === true ? "live" : moved === "bad_goal" ? "bad_goal" : "not_found";
}
