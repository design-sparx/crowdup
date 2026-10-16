import type {ActionFunctionArgs} from "react-router";
import {syncAccountStatus} from "../data-access/stripe/connect";
import {getPublishingMode} from "../data-access/stripe/connect.server";
import {supabaseConnectStore} from "../data-access/stripe/connectStore.server";
import {createServiceRoleClient} from "../data-access/stripe/serviceRole.server";
import {createStripeConnectApi} from "../data-access/stripe/stripe.server";
import {verifyStripeWebhook} from "../data-access/stripe/webhook.server";

/**
 * Stripe webhook endpoint (resource route, no UI). Today it handles `account.updated` so
 * onboarding status stays in sync even if the organiser never returns to the app. Ticket
 * #18 adds the donation events to the same switch; the verification helper is shared.
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
    // Unhandled event types are acknowledged so Stripe does not retry them.
    return new Response(null, {status: 200});
}
