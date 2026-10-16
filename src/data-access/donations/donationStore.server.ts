import type {SupabaseClient} from "@supabase/supabase-js";
import type {DonationWriter} from "./donationWebhook";
import type {DonationTarget} from "../../lib/donations/checkout";

/**
 * Service-role access for donations. Narrow on purpose: the webhook can only look up a
 * campaign and insert one confirmed donation; checkout can only read what it needs to
 * decide eligibility. Never import from components.
 */

interface CampaignRow {
    id: string;
    slug: string;
    title: string;
    status: string;
    end_date: string | null;
    currency: string;
    owner_id: string;
}

const COLUMNS = "id, slug, title, status, end_date, currency, owner_id";

async function ownerOf(db: SupabaseClient, ownerId: string) {
    const {data, error} = await db
        .from("profile")
        .select("stripe_account_id, stripe_onboarding_complete, suspended")
        .eq("id", ownerId)
        .maybeSingle();
    if (error) throw new Error(error.message);
    return {
        stripeAccountId: (data?.stripe_account_id as string | null | undefined) ?? null,
        onboardingComplete: Boolean(data?.stripe_onboarding_complete),
        suspended: Boolean(data?.suspended),
    };
}

export function supabaseDonationWriter(db: SupabaseClient): DonationWriter {
    return {
        async findCampaign(id) {
            const {data, error} = await db.from("campaign").select(COLUMNS).eq("id", id).maybeSingle();
            if (error) throw new Error(error.message);
            if (!data) return null;
            const row = data as CampaignRow;
            const owner = await ownerOf(db, row.owner_id);
            return {
                id: row.id,
                status: row.status,
                endDate: row.end_date,
                currency: row.currency,
                ownerStripeAccountId: owner.stripeAccountId,
            };
        },
        async insertDonation(row) {
            const {error} = await db.from("donation").insert({
                campaign_id: row.campaignId,
                amount: row.amount,
                fee_amount: row.feeAmount,
                currency: row.currency,
                donor_name: row.donorName,
                donor_email: row.donorEmail,
                anonymous: row.anonymous,
                message: row.message,
                donor_user_id: row.donorUserId,
                stripe_checkout_session_id: row.sessionId,
                stripe_payment_intent_id: row.paymentIntentId,
                stripe_event_id: row.eventId,
                flagged_reason: row.flaggedReason,
                status: "confirmed",
                confirmed_at: new Date().toISOString(),
            });
            // 23505 = unique violation on event id, session id or payment intent: already recorded.
            if (error?.code === "23505") return "duplicate";
            if (error) throw new Error(error.message);
            return "inserted";
        },
    };
}

/** Reads a campaign by slug together with its organiser's Stripe state (checkout only). */
export async function loadDonationTarget(db: SupabaseClient, slug: string): Promise<DonationTarget | null> {
    const {data, error} = await db.from("campaign").select(COLUMNS).eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const row = data as CampaignRow;
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        status: row.status,
        endDate: row.end_date,
        currency: row.currency,
        owner: await ownerOf(db, row.owner_id),
    };
}
