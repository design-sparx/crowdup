import type Stripe from "stripe";
import {canAcceptDonations} from "../campaigns/lifecycle";
import type {DonorInput} from "./donor";
import {buildDonationMetadata} from "./metadata";

/** What the server needs to know about a campaign to decide whether it can take money. */
export interface DonationTarget {
    id: string;
    slug: string;
    title: string;
    status: string;
    endDate: string | null;
    currency: string;
    owner: {stripeAccountId: string | null; onboardingComplete: boolean; suspended: boolean};
}

export type Eligibility = {ok: true} | {ok: false; reason: string};

/**
 * Server-side gate, independent of the UI: the campaign must pass ticket #17's
 * canAcceptDonations rule and the organiser must have a charges-enabled Stripe account
 * (onboarding complete means charges_enabled was seen on the last sync).
 */
export function checkDonationEligibility(target: DonationTarget, now: Date = new Date()): Eligibility {
    if (!canAcceptDonations({status: target.status, endDate: target.endDate}, now)) {
        return {ok: false, reason: "This campaign is not accepting donations."};
    }
    const {owner} = target;
    if (owner.suspended || !owner.stripeAccountId || !owner.onboardingComplete) {
        return {ok: false, reason: "This organiser cannot receive donations right now."};
    }
    return {ok: true};
}

export interface CheckoutInput {
    target: DonationTarget;
    amountMinor: number;
    /** Platform fee in minor units. 0 means no application fee is sent. */
    feeMinor: number;
    donor: DonorInput;
    userId: string | null;
    /** Trusted origin (SITE_URL). Never derived from request headers. */
    siteUrl: string;
}

/** Parameters for a DIRECT CHARGE Checkout Session (send with the `stripeAccount` option). */
export function buildCheckoutSessionParams(i: CheckoutInput): Stripe.Checkout.SessionCreateParams {
    const metadata = buildDonationMetadata({
        campaignId: i.target.id,
        anonymous: i.donor.anonymous,
        donorName: i.donor.name,
        message: i.donor.message,
        userId: i.userId,
        fee: i.feeMinor,
    });
    const page = `${i.siteUrl}/campaigns/${encodeURIComponent(i.target.slug)}`;
    return {
        mode: "payment",
        submit_type: "donate",
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: i.target.currency.toLowerCase(),
                    unit_amount: i.amountMinor,
                    product_data: {name: `Donation: ${i.target.title}`.slice(0, 250)},
                },
            },
        ],
        ...(i.donor.email ? {customer_email: i.donor.email} : {}),
        metadata,
        payment_intent_data: {
            metadata,
            ...(i.feeMinor > 0 ? {application_fee_amount: i.feeMinor} : {}),
        },
        success_url: `${page}/thanks`,
        cancel_url: `${page}?donation=cancelled`,
    };
}
