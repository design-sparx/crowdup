import type {ActionFunctionArgs} from "react-router";
import {syncAccountStatus} from "../data-access/stripe/connect";
import {getPublishingMode} from "../data-access/stripe/connect.server";
import {supabaseConnectStore} from "../data-access/stripe/connectStore.server";
import {createServiceRoleClient} from "../data-access/stripe/serviceRole.server";
import {createStripeConnectApi} from "../data-access/stripe/stripe.server";
import {verifyStripeWebhook} from "../data-access/stripe/webhook.server";
import {DONATION_EVENT_TYPES, handleDonationEvent} from "../data-access/donations/donationWebhook";
import {supabaseDonationWriter} from "../data-access/donations/donationStore.server";

/**
 * Stripe webhook endpoint (resource route, no UI). One Connect endpoint ("Events from
 * connected accounts") with one signing secret (STRIPE_WEBHOOK_SECRET) handles:
 * - `account.updated`, so onboarding status stays in sync even if the organiser never
 *   returns to the app;
 * - `checkout.session.completed` and `checkout.session.async_payment_succeeded`, which
 *   record donations (see data-access/donations/donationWebhook.ts).
 *
 * The event only tells us WHICH account changed. Status is re-read from Stripe, so a
 * forged or replayed payload cannot set anything, and syncing is idempotent.
 */
export async function loader() {
    return new Response("Method not allowed", {status: 405, headers: {Allow: "POST"}});
}

export async function action({request}: ActionFunctionArgs) {
    const verified = await verifyStripeWebhook(request);
    if (!verified.ok) return verified.response;
    const {event} = verified;

    if (event.type === "account.updated") {
        const accountId = event.data.object.id;
        const store = supabaseConnectStore(createServiceRoleClient());
        const userId = await store.findUserByAccountId(accountId);
        if (userId) {
            await syncAccountStatus({api: createStripeConnectApi(), store, userId, mode: getPublishingMode()});
        }
    }
    if (DONATION_EVENT_TYPES.has(event.type)) {
        // A database error throws and becomes a 500, so Stripe retries. Everything else is a 200.
        const result = await handleDonationEvent(event, {db: supabaseDonationWriter(createServiceRoleClient())});
        if (result.outcome === "ignored") console.warn(`donation event ${event.id} ignored: ${result.reason}`);
    }
    // Unhandled event types are acknowledged so Stripe does not retry them.
    return new Response(null, {status: 200});
}
