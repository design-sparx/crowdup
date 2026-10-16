import type Stripe from "stripe";
import {canAcceptDonations} from "../../lib/campaigns/lifecycle";
import type {CampaignStatus} from "../../lib/campaigns/transitions";
import {parseDonationMetadata} from "../../lib/donations/metadata";

/**
 * Donation webhook logic: a pure function over a signature-VERIFIED Stripe event and an
 * injected database writer, so it is unit-testable without Stripe or a database.
 *
 * Trust model: the event itself is trusted only because verifyStripeWebhook checked the
 * signature on the raw body. Its metadata is still validated: the campaign must exist, the
 * event's connected account must be the campaign owner's Stripe account, and the currency
 * must match the campaign. Anything that does not fit is acknowledged (200) and not
 * written, so Stripe does not retry forever. Only database errors throw (Stripe retries).
 *
 * Idempotency: the donation table has UNIQUE stripe_event_id and stripe_checkout_session_id.
 * A duplicate delivery, or a second event type for the same session, hits the constraint
 * and is reported as "duplicate" (a success). Totals come from confirmed rows only, so a
 * replay can never double count.
 *
 * Out of order: the webhook is the only writer. The success redirect writes nothing, so
 * there is no race between redirect and webhook; the page just shows whatever is confirmed.
 *
 * Campaign no longer live at payment time: money has already moved to the organiser, so the
 * donation is still recorded (and counted) but flagged for admin review.
 */

export interface CampaignForDonation {
    id: string;
    status: CampaignStatus;
    endDate: string | null;
    currency: string;
    ownerStripeAccountId: string | null;
}

export interface DonationRow {
    campaignId: string;
    amount: number;
    feeAmount: number;
    currency: string;
    donorName: string | null;
    donorEmail: string | null;
    anonymous: boolean;
    message: string | null;
    donorUserId: string | null;
    sessionId: string;
    paymentIntentId: string | null;
    eventId: string;
    flaggedReason: string | null;
}

export interface DonationWriter {
    findCampaign(id: string): Promise<CampaignForDonation | null>;
    /** Inserts a CONFIRMED donation. Returns "duplicate" on a unique violation. */
    insertDonation(row: DonationRow): Promise<"inserted" | "duplicate">;
}

export type DonationEventResult = {outcome: "recorded" | "duplicate"} | {outcome: "ignored"; reason: string};

/** Stripe event types that record a donation. The webhook route uses this to decide what to pass in. */
export const DONATION_EVENT_TYPES: ReadonlySet<string> = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ignored = (reason: string): DonationEventResult => ({outcome: "ignored", reason});

export async function handleDonationEvent(
    event: Stripe.Event,
    deps: {db: DonationWriter; now?: Date},
): Promise<DonationEventResult> {
    if (!DONATION_EVENT_TYPES.has(event.type)) return ignored("event type not handled");
    // Donations are direct charges on connected accounts, so real events carry `account`.
    if (!event.account) return ignored("not a connected-account event");

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return ignored("payment not completed");

    const meta = parseDonationMetadata(session.metadata);
    if (!meta || !UUID.test(meta.campaignId)) return ignored("not a CrowdUp donation");

    const amount = session.amount_total;
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) return ignored("invalid amount");

    const campaign = await deps.db.findCampaign(meta.campaignId);
    if (!campaign) return ignored("unknown campaign");
    if (campaign.ownerStripeAccountId !== event.account) return ignored("account does not own the campaign");
    const currency = (session.currency ?? "").toUpperCase();
    if (currency !== campaign.currency.toUpperCase()) return ignored("currency mismatch");

    const live = canAcceptDonations({status: campaign.status, endDate: campaign.endDate}, deps.now ?? new Date());
    const paymentIntent = session.payment_intent;
    const result = await deps.db.insertDonation({
        campaignId: campaign.id,
        amount,
        // The fee is requested by us at checkout; never trust it beyond the donation amount.
        feeAmount: meta.fee > 0 && meta.fee < amount ? meta.fee : 0,
        currency,
        donorName: meta.donorName,
        donorEmail: session.customer_details?.email ?? session.customer_email ?? null,
        anonymous: meta.anonymous,
        message: meta.message,
        donorUserId: meta.userId && UUID.test(meta.userId) ? meta.userId : null,
        sessionId: session.id,
        paymentIntentId: typeof paymentIntent === "string" ? paymentIntent : (paymentIntent?.id ?? null),
        eventId: event.id,
        flaggedReason: live ? null : "campaign not live at payment time",
    });
    return {outcome: result === "inserted" ? "recorded" : "duplicate"};
}
