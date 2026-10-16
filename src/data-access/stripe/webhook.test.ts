import {describe, expect, it} from "vitest";
import {verifyStripeWebhook} from "./webhook.server";

type Constructor = (body: string, sig: string, secret: string) => Promise<unknown>;
const stripeWith = (fn: Constructor) => ({webhooks: {constructEventAsync: fn}}) as never;
const req = (withSig = true) =>
    new Request("https://x/api/stripe/webhook", {
        method: "POST",
        body: "{}",
        headers: withSig ? {"stripe-signature": "t=1,v1=abc"} : {},
    });

describe("verifyStripeWebhook", () => {
    it("returns the verified event, passing the raw body, signature and secret through", async () => {
        const seen: string[] = [];
        const r = await verifyStripeWebhook(req(), {
            secret: "whsec_1",
            stripe: stripeWith(async (b, s, sec) => {
                seen.push(b, s, sec);
                return {id: "evt_1", type: "account.updated"};
            }),
        });
        expect(r.ok && r.event.id).toBe("evt_1");
        expect(seen).toEqual(["{}", "t=1,v1=abc", "whsec_1"]);
    });
    it("rejects a missing signature with 400", async () => {
        const r = await verifyStripeWebhook(req(false), {secret: "s", stripe: stripeWith(async () => ({}))});
        expect(!r.ok && r.response.status).toBe(400);
    });
    it("rejects a bad signature with 400", async () => {
        const r = await verifyStripeWebhook(req(), {
            secret: "s",
            stripe: stripeWith(async () => {
                throw new Error("bad");
            }),
        });
        expect(!r.ok && r.response.status).toBe(400);
    });
    it("rejects non-POST with 405", async () => {
        const r = await verifyStripeWebhook(new Request("https://x/", {method: "GET"}), {secret: "s"});
        expect(!r.ok && r.response.status).toBe(405);
    });
    it("fails closed with 500 when no secret is configured", async () => {
        const saved = process.env.STRIPE_WEBHOOK_SECRET;
        delete process.env.STRIPE_WEBHOOK_SECRET;
        try {
            const r = await verifyStripeWebhook(req(), {stripe: stripeWith(async () => ({}))});
            expect(!r.ok && r.response.status).toBe(500);
        } finally {
            if (saved !== undefined) process.env.STRIPE_WEBHOOK_SECRET = saved;
        }
    });
});
