import Stripe from "stripe";
import type {StripeConnectApi} from "./connect";

/**
 * Server-only Stripe client. The `.server` suffix keeps it out of client bundles. The SDK
 * is pinned to an exact version and uses the API version it was built against, so
 * upgrading the package is the only way to change API behaviour.
 */
let cached: Stripe | undefined;

export function getStripe(): Stripe {
    if (cached) return cached;
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set (see .env.example)");
    return (cached = new Stripe(key));
}

/** Real implementation of the injected Stripe calls used by the Connect flow. */
export function createStripeConnectApi(stripe: Stripe = getStripe()): StripeConnectApi {
    return {
        async createAccount({email, userId}) {
            const account = await stripe.accounts.create({
                type: "standard",
                ...(email ? {email} : {}),
                metadata: {crowdup_user_id: userId},
            });
            return {id: account.id};
        },
        async createAccountLink({account, returnUrl, refreshUrl}) {
            const link = await stripe.accountLinks.create({
                account,
                type: "account_onboarding",
                return_url: returnUrl,
                refresh_url: refreshUrl,
            });
            return {url: link.url};
        },
        async retrieveAccount(id) {
            const a = await stripe.accounts.retrieve(id);
            return {
                id: a.id,
                detailsSubmitted: a.details_submitted ?? false,
                chargesEnabled: a.charges_enabled ?? false,
                defaultCurrency: a.default_currency ?? null,
            };
        },
    };
}
