import type {SupabaseClient} from "@supabase/supabase-js";
import type {DashboardCampaign, DashboardDonation} from "../../lib/dashboard/dashboard";

/**
 * Organiser dashboard reads. Called with the cookie-bound client so RLS applies.
 * Campaigns are filtered by owner explicitly (RLS also shows live campaigns of others).
 * Donations come from the `public_donation` view: confirmed only, and the donor name is
 * already null where the donor chose anonymity, so identity never reaches this layer.
 */

/** Upper bound on donation rows read for the dashboard totals and chart. */
export const DONATION_LIMIT = 5000;

interface CampaignRow {
    id: string;
    slug: string;
    title: string;
    status: string;
    currency: string | null;
    goal_amount: number;
    suspended_reason: string | null;
    rejection_reason: string | null;
}

interface DonationRow {
    id: string;
    campaign_id: string;
    amount: number;
    currency: string;
    created_at: string;
    anonymous: boolean;
    donor_name: string | null;
}

function fail(error: {message: string}): never {
    throw new Error(error.message);
}

export async function getDashboardData(
    client: SupabaseClient,
    userId: string,
): Promise<{campaigns: DashboardCampaign[]; donations: DashboardDonation[]}> {
    const campaignRes = await client
        .from("campaign")
        .select("id, slug, title, status, currency, goal_amount, suspended_reason, rejection_reason")
        .eq("owner_id", userId)
        .order("created_at", {ascending: false});
    if (campaignRes.error) fail(campaignRes.error);

    const campaigns = ((campaignRes.data ?? []) as CampaignRow[]).map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        status: r.status,
        currency: r.currency,
        goalAmount: Number(r.goal_amount),
        suspendedReason: r.suspended_reason,
        rejectionReason: r.rejection_reason,
    }));
    if (campaigns.length === 0) return {campaigns, donations: []};

    const donationRes = await client
        .from("public_donation")
        .select("id, campaign_id, amount, currency, created_at, anonymous, donor_name")
        .in("campaign_id", campaigns.map((c) => c.id))
        .order("created_at", {ascending: false})
        .limit(DONATION_LIMIT);
    if (donationRes.error) fail(donationRes.error);

    const donations = ((donationRes.data ?? []) as DonationRow[]).map((r) => ({
        id: r.id,
        campaignId: r.campaign_id,
        amount: Number(r.amount),
        currency: r.currency,
        createdAt: r.created_at,
        anonymous: r.anonymous,
        donorName: r.anonymous ? null : r.donor_name,
    }));
    return {campaigns, donations};
}
