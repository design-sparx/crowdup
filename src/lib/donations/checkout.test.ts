import {describe, expect, it} from "vitest";
import {buildCheckoutSessionParams, checkDonationEligibility, type DonationTarget} from "./checkout";

const now = new Date("2026-06-15T12:00:00Z");
const target: DonationTarget = {
    id: "camp-1",
    slug: "clean-water",
    title: "Clean water",
    status: "live",
    endDate: null,
    currency: "KES",
    owner: {stripeAccountId: "acct_1", onboardingComplete: true, suspended: false},
};

describe("checkDonationEligibility", () => {
    it("accepts a live campaign with a charges-enabled organiser", () => {
        expect(checkDonationEligibility(target, now)).toEqual({ok: true});
    });
    it.each(["draft", "closed", "suspended"])("refuses a %s campaign", (status) => {
        expect(checkDonationEligibility({...target, status}, now).ok).toBe(false);
    });
    it("refuses an ended campaign", () => {
        expect(checkDonationEligibility({...target, endDate: "2026-06-15T11:00:00Z"}, now).ok).toBe(false);
    });
    it("refuses when the organiser has no Stripe account", () => {
        const owner = {...target.owner, stripeAccountId: null};
        expect(checkDonationEligibility({...target, owner}, now).ok).toBe(false);
    });
    it("refuses when onboarding is incomplete or the organiser is suspended", () => {
        expect(checkDonationEligibility({...target, owner: {...target.owner, onboardingComplete: false}}, now).ok).toBe(false);
        expect(checkDonationEligibility({...target, owner: {...target.owner, suspended: true}}, now).ok).toBe(false);
    });
});

describe("buildCheckoutSessionParams", () => {
    const input = {
        target,
        amountMinor: 5000,
        feeMinor: 0,
        donor: {name: "Ada", email: "ada@example.com", message: "Hi", anonymous: false},
        userId: "user-1",
        siteUrl: "https://crowdup.example",
    };
    it("is a one-off payment in the campaign currency, with URLs built from the site url only", () => {
        const p = buildCheckoutSessionParams(input);
        expect(p.mode).toBe("payment");
        expect(p.line_items?.[0]).toMatchObject({quantity: 1, price_data: {currency: "kes", unit_amount: 5000}});
        expect(p.success_url).toBe("https://crowdup.example/campaigns/clean-water/thanks");
        expect(p.cancel_url).toBe("https://crowdup.example/campaigns/clean-water?donation=cancelled");
    });
    it("sends no application fee when the fee is 0", () => {
        const p = buildCheckoutSessionParams(input);
        expect(p.payment_intent_data).not.toHaveProperty("application_fee_amount");
    });
    it("sends the application fee when it is positive", () => {
        const p = buildCheckoutSessionParams({...input, feeMinor: 250});
        expect(p.payment_intent_data?.application_fee_amount).toBe(250);
        expect(p.metadata?.crowdup_fee).toBe("250");
    });
    it("carries campaign, anonymity, donor name, message and user in metadata", () => {
        const p = buildCheckoutSessionParams({...input, donor: {...input.donor, anonymous: true}});
        expect(p.metadata).toMatchObject({
            crowdup_campaign_id: "camp-1",
            crowdup_anonymous: "true",
            crowdup_donor_name: "Ada",
            crowdup_message: "Hi",
            crowdup_user_id: "user-1",
        });
    });
    it("prefills the email only when given, and omits the user for guests", () => {
        expect(buildCheckoutSessionParams(input).customer_email).toBe("ada@example.com");
        const guest = buildCheckoutSessionParams({...input, userId: null, donor: {...input.donor, email: null}});
        expect(guest).not.toHaveProperty("customer_email");
        expect(guest.metadata).not.toHaveProperty("crowdup_user_id");
    });
});
