import {describe, expect, it} from "vitest";
import type {SupabaseClient} from "@supabase/supabase-js";
import {countOpenUnmatched, listOpenUnmatched, resolveUnmatched} from "./unmatched.server";

const ID = "20000000-0000-4000-8000-000000000001";

function listClient(rows: unknown[]) {
    const calls: [string, ...unknown[]][] = [];
    const b: Record<string, unknown> = {
        select: (...a: unknown[]) => { calls.push(["select", ...a]); return b; },
        is: (...a: unknown[]) => { calls.push(["is", ...a]); return b; },
        order: (...a: unknown[]) => { calls.push(["order", ...a]); return b; },
        limit: (...a: unknown[]) => { calls.push(["limit", ...a]); return Promise.resolve({data: rows, error: null}); },
    };
    return {client: {from: () => b} as unknown as SupabaseClient, calls};
}

describe("listOpenUnmatched", () => {
    it("lists only unresolved payments, oldest first, mapped for the page", async () => {
        const {client, calls} = listClient([
            {
                id: ID, created_at: "2026-10-17T10:00:00Z", amount: 5000, currency: "KES", reason: "unknown campaign",
                stripe_account_id: "acct_1", campaign_id: "c1", stripe_event_id: "evt_1",
                stripe_checkout_session_id: "cs_1", stripe_payment_intent_id: "pi_1",
            },
        ]);
        const rows = await listOpenUnmatched(client);
        expect(calls).toContainEqual(["is", "resolved_at", null]);
        expect(rows).toEqual([
            {
                id: ID, createdAt: "2026-10-17T10:00:00Z", amount: 5000, currency: "KES", reason: "unknown campaign",
                accountId: "acct_1", campaignId: "c1", eventId: "evt_1", sessionId: "cs_1", paymentIntentId: "pi_1",
            },
        ]);
    });
});

describe("countOpenUnmatched", () => {
    it("counts unresolved payments", async () => {
        const b: Record<string, unknown> = {
            select: () => b,
            is: () => Promise.resolve({count: 3, error: null}),
        };
        expect(await countOpenUnmatched({from: () => b} as unknown as SupabaseClient)).toBe(3);
    });
});

describe("resolveUnmatched", () => {
    function updateClient(rows: unknown[]) {
        const patches: Record<string, unknown>[] = [];
        const b: Record<string, unknown> = {
            update: (p: Record<string, unknown>) => { patches.push(p); return b; },
            eq: () => b,
            is: () => b,
            select: () => Promise.resolve({data: rows, error: null}),
        };
        return {client: {from: () => b} as unknown as SupabaseClient, patches};
    }
    it("marks one open payment reviewed", async () => {
        const {client, patches} = updateClient([{id: ID}]);
        expect(await resolveUnmatched(client, ID)).toBe("resolved");
        expect(Object.keys(patches[0])).toEqual(["resolved_at"]);
    });
    it("reports a payment that is already reviewed or not visible", async () => {
        const {client} = updateClient([]);
        expect(await resolveUnmatched(client, ID)).toBe("not_found");
    });
    it("rejects anything that is not a uuid before touching the database", async () => {
        const {client, patches} = updateClient([{id: ID}]);
        expect(await resolveUnmatched(client, "1; drop table")).toBe("invalid");
        expect(patches).toHaveLength(0);
    });
});
