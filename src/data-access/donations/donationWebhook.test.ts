import Stripe from "stripe";
import {describe, expect, it} from "vitest";
import {verifyStripeWebhook} from "../stripe/webhook.server";
import {handleDonationEvent, type CampaignForDonation, type DonationRow, type DonationWriter, type UnmatchedPaymentRow} from "./donationWebhook";

const SECRET = "whsec_test_fixture_secret";
const CAMPAIGN_ID = "10000000-0000-4000-8000-000000000001";
const USER_ID = "00000000-0000-4000-8000-000000000005";
const now = new Date("2026-06-15T12:00:00Z");

// A real (offline) Stripe instance: only used for signing and verifying, never for network.
const stripe = new Stripe("sk_test_offline_fixture");

/** Recorded-style event: shaped like a Stripe `checkout.session.completed` from a connected account. */
function sessionEvent(over: {id?: string; type?: string; account?: string | null; session?: Record<string, unknown>} = {}) {
    return {
        id: over.id ?? "evt_1",
        object: "event",
        api_version: "2025-01-01",
        created: 1781524800,
        livemode: false,
        pending_webhooks: 1,
        request: {id: null, idempotency_key: null},
        type: over.type ?? "checkout.session.completed",
        ...(over.account === null ? {} : {account: over.account ?? "acct_1"}),
        data: {
            object: {
                id: "cs_test_1",
                object: "checkout.session",
                mode: "payment",
                payment_status: "paid",
                amount_total: 5000,
                currency: "kes",
                payment_intent: "pi_test_1",
                customer_details: {email: "ada@example.com", name: "Ada L"},
                metadata: {
                    crowdup_campaign_id: CAMPAIGN_ID,
                    crowdup_anonymous: "false",
                    crowdup_donor_name: "Ada",
                    crowdup_message: "Keep going",
                    crowdup_user_id: USER_ID,
                    crowdup_fee: "250",
                },
                ...over.session,
            },
        },
    };
}

/** Signs the payload exactly as Stripe does, then verifies it with the production helper. */
async function deliver(payload: unknown, opts: {secret?: string; tamper?: boolean} = {}) {
    const body = JSON.stringify(payload);
    const header = stripe.webhooks.generateTestHeaderString({payload: body, secret: opts.secret ?? SECRET});
    const request = new Request("https://crowdup.example/api/stripe/webhook", {
        method: "POST",
        body: opts.tamper ? body.replace("5000", "9999") : body,
        headers: {"stripe-signature": header},
    });
    return verifyStripeWebhook(request, {secret: SECRET, stripe});
}

const liveCampaign: CampaignForDonation = {
    id: CAMPAIGN_ID,
    status: "live",
    endDate: null,
    currency: "KES",
    ownerStripeAccountId: "acct_1",
};

function fakeDb(campaign: CampaignForDonation | null = liveCampaign) {
    const rows: DonationRow[] = [];
    const unmatched: UnmatchedPaymentRow[] = [];
    const seen = new Set<string>();
    const db: DonationWriter = {
        async findCampaign(id) {
            return campaign && campaign.id === id ? campaign : null;
        },
        async insertDonation(row) {
            if (seen.has(row.eventId) || rows.some((r) => r.sessionId === row.sessionId)) return "duplicate";
            seen.add(row.eventId);
            rows.push(row);
            return "inserted";
        },
        async recordUnmatched(row) {
            if (!unmatched.some((u) => u.eventId === row.eventId)) unmatched.push(row);
        },
    };
    return {db, rows, unmatched};
}

async function run(payload: unknown, db: DonationWriter) {
    const v = await deliver(payload);
    if (!v.ok) throw new Error("fixture failed verification");
    return handleDonationEvent(v.event, {db, now});
}

describe("signature verification (real signing, production helper)", () => {
    it("accepts a correctly signed event", async () => {
        expect((await deliver(sessionEvent())).ok).toBe(true);
    });
    it("rejects a wrong secret with 400", async () => {
        const r = await deliver(sessionEvent(), {secret: "whsec_other"});
        expect(!r.ok && r.response.status).toBe(400);
    });
    it("rejects a tampered body with 400", async () => {
        const r = await deliver(sessionEvent(), {tamper: true});
        expect(!r.ok && r.response.status).toBe(400);
    });
});

describe("handleDonationEvent", () => {
    it("records a paid session as a confirmed donation with the Stripe event id", async () => {
        const {db, rows} = fakeDb();
        const r = await run(sessionEvent(), db);
        expect(r).toEqual({outcome: "recorded"});
        expect(rows).toEqual([
            {
                campaignId: CAMPAIGN_ID,
                amount: 5000,
                feeAmount: 250,
                currency: "KES",
                donorName: "Ada",
                donorEmail: "ada@example.com",
                anonymous: false,
                message: "Keep going",
                donorUserId: USER_ID,
                sessionId: "cs_test_1",
                paymentIntentId: "pi_test_1",
                eventId: "evt_1",
                flaggedReason: null,
            },
        ]);
    });

    it("is idempotent: a duplicate delivery never double counts", async () => {
        const {db, rows} = fakeDb();
        await run(sessionEvent(), db);
        const again = await run(sessionEvent(), db);
        expect(again).toEqual({outcome: "duplicate"});
        expect(rows).toHaveLength(1);
    });

    it("a second event for the same session (replayed out of order) is a no-op", async () => {
        const {db, rows} = fakeDb();
        await run(sessionEvent({id: "evt_2", type: "checkout.session.async_payment_succeeded"}), db);
        const late = await run(sessionEvent({id: "evt_1"}), db);
        expect(late.outcome).toBe("duplicate");
        expect(rows).toHaveLength(1);
    });

    it("records on async_payment_succeeded", async () => {
        const {db, rows} = fakeDb();
        const r = await run(sessionEvent({type: "checkout.session.async_payment_succeeded"}), db);
        expect(r.outcome).toBe("recorded");
        expect(rows).toHaveLength(1);
    });

    it("does not record an unpaid session (waiting for async payment)", async () => {
        const {db, rows} = fakeDb();
        const r = await run(sessionEvent({session: {payment_status: "unpaid"}}), db);
        expect(r.outcome).toBe("ignored");
        expect(rows).toHaveLength(0);
    });

    it("ignores async_payment_failed and unrelated events with no write", async () => {
        const {db, rows} = fakeDb();
        expect((await run(sessionEvent({type: "checkout.session.async_payment_failed"}), db)).outcome).toBe("ignored");
        expect((await run(sessionEvent({type: "charge.refunded"}), db)).outcome).toBe("ignored");
        expect((await run(sessionEvent({type: "account.updated"}), db)).outcome).toBe("ignored");
        expect(rows).toHaveLength(0);
    });

    it("ignores platform events (no connected account)", async () => {
        const {db, rows} = fakeDb();
        expect((await run(sessionEvent({account: null}), db)).outcome).toBe("ignored");
        expect(rows).toHaveLength(0);
    });

    it("ignores sessions without our metadata (the organiser's own Stripe sales)", async () => {
        const {db, rows} = fakeDb();
        expect((await run(sessionEvent({session: {metadata: {}}}), db)).outcome).toBe("ignored");
        expect((await run(sessionEvent({session: {metadata: null}}), db)).outcome).toBe("ignored");
        expect((await run(sessionEvent({session: {metadata: {crowdup_campaign_id: "not-a-uuid"}}}), db)).outcome).toBe("ignored");
        expect(rows).toHaveLength(0);
    });

    it("records money for an unknown campaign as an unmatched payment, never a donation", async () => {
        const {db, rows, unmatched} = fakeDb(null);
        expect(await run(sessionEvent(), db)).toEqual({outcome: "unmatched", reason: "unknown campaign"});
        expect(rows).toHaveLength(0);
        expect(unmatched).toEqual([
            {
                eventId: "evt_1",
                sessionId: "cs_test_1",
                paymentIntentId: "pi_test_1",
                accountId: "acct_1",
                campaignId: CAMPAIGN_ID,
                amount: 5000,
                currency: "KES",
                reason: "unknown campaign",
            },
        ]);
    });

    it("records an event from an account that does not own the campaign as unmatched", async () => {
        const {db, rows, unmatched} = fakeDb();
        const r = await run(sessionEvent({account: "acct_evil"}), db);
        expect(r).toEqual({outcome: "unmatched", reason: "account does not own the campaign"});
        expect(rows).toHaveLength(0);
        expect(unmatched[0]).toMatchObject({accountId: "acct_evil", campaignId: CAMPAIGN_ID});
    });

    it("records a currency that differs from the campaign currency as unmatched", async () => {
        const {db, rows, unmatched} = fakeDb();
        const r = await run(sessionEvent({session: {currency: "usd"}}), db);
        expect(r).toEqual({outcome: "unmatched", reason: "currency mismatch"});
        expect(rows).toHaveLength(0);
        expect(unmatched[0]).toMatchObject({currency: "USD", amount: 5000});
    });

    it("still records an unmatched payment whose currency is missing, with a placeholder the table accepts", async () => {
        const {db, unmatched} = fakeDb(null);
        const r = await run(sessionEvent({session: {currency: null}}), db);
        expect(r.outcome).toBe("unmatched");
        expect(unmatched[0].currency).toBe("XXX");
    });

    it("recording an unmatched payment is idempotent across redeliveries", async () => {
        const {db, unmatched} = fakeDb(null);
        await run(sessionEvent(), db);
        await run(sessionEvent(), db);
        expect(unmatched).toHaveLength(1);
    });

    it("ignores a missing or non-positive amount", async () => {
        const {db, rows} = fakeDb();
        expect((await run(sessionEvent({session: {amount_total: 0}}), db)).outcome).toBe("ignored");
        expect((await run(sessionEvent({session: {amount_total: null}}), db)).outcome).toBe("ignored");
        expect(rows).toHaveLength(0);
    });

    it("still records money that moved after the campaign closed, flagged for review", async () => {
        const {db, rows} = fakeDb({...liveCampaign, status: "closed"});
        const r = await run(sessionEvent(), db);
        expect(r.outcome).toBe("recorded");
        expect(rows[0].flaggedReason).toMatch(/not live/i);
    });

    it("flags a payment confirmed after the end date", async () => {
        const {db, rows} = fakeDb({...liveCampaign, endDate: "2026-06-15T11:00:00Z"});
        await run(sessionEvent(), db);
        expect(rows[0].flaggedReason).toMatch(/not live/i);
    });

    it("keeps the anonymous flag and tolerates missing optional metadata", async () => {
        const {db, rows} = fakeDb();
        await run(
            sessionEvent({session: {metadata: {crowdup_campaign_id: CAMPAIGN_ID, crowdup_anonymous: "true"}}}),
            db,
        );
        expect(rows[0]).toMatchObject({anonymous: true, donorName: null, message: null, donorUserId: null, feeAmount: 0});
    });

    it("never records a fee larger than the amount, or a malformed user id", async () => {
        const {db, rows} = fakeDb();
        await run(
            sessionEvent({
                session: {metadata: {crowdup_campaign_id: CAMPAIGN_ID, crowdup_fee: "999999", crowdup_user_id: "bogus"}},
            }),
            db,
        );
        expect(rows[0].feeAmount).toBe(0);
        expect(rows[0].donorUserId).toBeNull();
    });

    it("lets a database error propagate so Stripe retries", async () => {
        const db: DonationWriter = {
            async findCampaign() {
                return liveCampaign;
            },
            async insertDonation() {
                throw new Error("db down");
            },
            async recordUnmatched() {
                throw new Error("db down");
            },
        };
        await expect(run(sessionEvent(), db)).rejects.toThrow("db down");
    });

    it("lets a database error while recording an unmatched payment propagate so Stripe retries", async () => {
        const db: DonationWriter = {
            async findCampaign() {
                return null;
            },
            async insertDonation() {
                throw new Error("unused");
            },
            async recordUnmatched() {
                throw new Error("db down");
            },
        };
        await expect(run(sessionEvent(), db)).rejects.toThrow("db down");
    });
});
