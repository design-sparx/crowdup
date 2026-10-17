import type Stripe from "stripe";
import {getStripe} from "./stripe.server";

/**
 * Signature-verified Stripe webhook helper. Shared by every webhook route (ticket #18
 * reuses it for donation events). Verification needs the exact raw body, so callers pass
 * the Request untouched: never read it with `request.json()` first.
 */
export type WebhookResult =
    | {ok: true; event: Stripe.Event}
    | {ok: false; response: Response};

export async function verifyStripeWebhook(
    request: Request,
    opts: {secret?: string; stripe?: Pick<Stripe, "webhooks">} = {},
): Promise<WebhookResult> {
    if (request.method !== "POST") {
        return {ok: false, response: new Response("Method not allowed", {status: 405, headers: {Allow: "POST"}})};
    }
    const secret = (opts.secret ?? process.env.STRIPE_WEBHOOK_SECRET)?.trim();
    if (!secret) {
        // Misconfiguration, not a client error: do not reveal details.
        console.error("STRIPE_WEBHOOK_SECRET is not set; rejecting webhook");
        return {ok: false, response: new Response("Webhook not configured", {status: 500})};
    }
    const signature = request.headers.get("stripe-signature");
    if (!signature) return {ok: false, response: new Response("Missing signature", {status: 400})};

    const body = await request.text();
    try {
        const stripe = opts.stripe ?? getStripe();
        const event = await stripe.webhooks.constructEventAsync(body, signature, secret);
        return {ok: true, event};
    } catch {
        return {ok: false, response: new Response("Invalid signature", {status: 400})};
    }
}
