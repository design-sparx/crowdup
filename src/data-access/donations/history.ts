import type {SupabaseClient} from "@supabase/supabase-js";
import {toDonationHistory, type DonationHistoryItem, type DonationHistoryRow} from "../../lib/donations/history";

/**
 * The signed-in donor's own donations. Reads the `my_donation` view with the cookie-bound
 * client, so the database filters on auth.uid() (donor_user_id), never on email. No filter
 * is applied here on purpose: the view is the enforcement.
 */
export async function listMyDonations(client: SupabaseClient): Promise<DonationHistoryItem[]> {
    const {data, error} = await client
        .from("my_donation")
        .select("id, amount, currency, created_at, status, campaign_title, campaign_slug")
        .order("created_at", {ascending: false})
        .limit(500);
    if (error) throw new Error(error.message);
    return toDonationHistory((data ?? []) as DonationHistoryRow[]);
}
