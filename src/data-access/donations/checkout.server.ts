import {getUser} from "../auth/auth.server";
import {createServiceRoleClient} from "../stripe/serviceRole.server";
import {getStripe} from "../stripe/stripe.server";
import {buildCheckoutSessionParams, checkDonationEligibility} from "../../lib/donations/checkout";
import {parseDonationAmount} from "../../lib/donations/amount";
import {parseDonorInput} from "../../lib/donations/donor";
import {calculatePlatformFee, getPlatformFeePercent} from "../../lib/donations/fee";
import {loadDonationTarget} from "./donationStore.server";

export type DonateResult = {error: string; status: number} | {redirectTo: string};

/** Public origin for Stripe return URLs: SITE_URL only (request headers are never used in production). */
function siteUrl(request: Request): string {
    const configured = process.env.SITE_URL?.trim().replace(/\/+$/, "");
    if (configured) return configured;
    if (process.env.NODE_ENV === "production") throw new Error("SITE_URL must be set in production (see .env.example)");
    return new URL(request.url).origin;
}

/**
 * Creates a Checkout Session as a DIRECT CHARGE on the organiser's connected account (the
 * `stripeAccount` option sets the Stripe-Account header). Everything is re-validated here:
 * the amount comes from the form, but the campaign state, currency and the organiser's
 * Stripe account come from the database, never from the client.
 */
export async function startDonation(request: Request, slug: string, form: FormData) {
    const {user, headers} = await getUser(request);
    const fail = (error: string, status: number) => ({result: {error, status} as DonateResult, headers});

    const target = await loadDonationTarget(createServiceRoleClient(), slug);
    if (!target) return fail("This campaign cannot receive donations.", 404);
    const eligible = checkDonationEligibility(target);
    if (!eligible.ok) return fail(eligible.reason, 409);

    const amount = parseDonationAmount(String(form.get("amount") ?? ""), target.currency);
    if (!amount.ok) return fail(amount.error, 400);
    const donor = parseDonorInput(form);
    if (!donor.ok) return fail(donor.error, 400);

    const percent = getPlatformFeePercent();
    const feeMinor = percent > 0 ? calculatePlatformFee(amount.minor, percent) : 0;

    const params = buildCheckoutSessionParams({
        target,
        amountMinor: amount.minor,
        feeMinor,
        donor: donor.value,
        userId: user?.id ?? null,
        siteUrl: siteUrl(request),
    });
    try {
        const session = await getStripe().checkout.sessions.create(params, {
            stripeAccount: target.owner.stripeAccountId as string,
        });
        if (!session.url) return fail("Could not start checkout. Please try again.", 502);
        return {result: {redirectTo: session.url} as DonateResult, headers};
    } catch (error) {
        console.error("Stripe checkout session failed", error instanceof Error ? error.message : error);
        return fail("Could not start checkout. Please try again.", 502);
    }
}
