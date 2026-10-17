/**
 * Checkout Session metadata. Stripe allows 50 keys, key names up to 40 chars and values up
 * to 500 chars; we use at most 6 short keys and truncate values by characters (never
 * splitting a surrogate pair). Metadata is set by OUR server when creating the session and
 * comes back in a signature-verified event, but the webhook still validates it.
 */
const MAX_VALUE = 500;

export interface DonationMetadata {
    campaignId: string;
    anonymous: boolean;
    donorName: string | null;
    message: string | null;
    userId: string | null;
    /** Platform fee requested at checkout, in minor units. */
    fee: number;
}

const truncate = (s: string) => Array.from(s).slice(0, MAX_VALUE).join("");

export function buildDonationMetadata(m: DonationMetadata): Record<string, string> {
    const out: Record<string, string> = {
        crowdup_campaign_id: truncate(m.campaignId),
        crowdup_anonymous: m.anonymous ? "true" : "false",
        crowdup_fee: String(m.fee),
    };
    if (m.donorName) out.crowdup_donor_name = truncate(m.donorName);
    if (m.message) out.crowdup_message = truncate(m.message);
    if (m.userId) out.crowdup_user_id = truncate(m.userId);
    return out;
}

export function parseDonationMetadata(raw: Record<string, string> | null | undefined): DonationMetadata | null {
    const campaignId = raw?.crowdup_campaign_id;
    if (!raw || !campaignId) return null;
    const fee = Number(raw.crowdup_fee);
    return {
        campaignId,
        anonymous: raw.crowdup_anonymous === "true",
        donorName: raw.crowdup_donor_name || null,
        message: raw.crowdup_message || null,
        userId: raw.crowdup_user_id || null,
        fee: Number.isSafeInteger(fee) && fee > 0 ? fee : 0,
    };
}
