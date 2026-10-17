import {describe, expect, it} from "vitest";
import type {SupabaseClient} from "@supabase/supabase-js";
import {decideCampaign} from "./approval.server";

const ID = "10000000-0000-4000-8000-000000000003";

function clientFailing(code: string | null, message = "") {
    return {rpc: async () => ({error: code ? {code, message} : null})} as unknown as SupabaseClient;
}
function form(entries: Record<string, string>) {
    const f = new FormData();
    for (const [k, v] of Object.entries(entries)) f.set(k, v);
    return f;
}

describe("decideCampaign approve", () => {
    it("approves", async () => {
        expect(await decideCampaign(clientFailing(null), form({campaignId: ID, intent: "approve"}))).toEqual({
            ok: true,
            message: "Campaign approved and live.",
        });
    });
    it("tells the admin why an ineligible organiser blocks approval, instead of a generic error", async () => {
        const r = await decideCampaign(
            clientFailing("CR001", "the organiser is suspended, so this campaign cannot be approved"),
            form({campaignId: ID, intent: "approve"}),
        );
        expect(r).toEqual({
            ok: false,
            error: "The organiser is suspended, so this campaign cannot be approved.",
            status: 409,
        });
    });
    it("explains an organiser who has not finished Stripe onboarding", async () => {
        const r = await decideCampaign(
            clientFailing("CR001", "the organiser has not completed Stripe onboarding, so this campaign cannot take donations"),
            form({campaignId: ID, intent: "approve"}),
        );
        expect(r.ok).toBe(false);
        if (!r.ok) {
            expect(r.status).toBe(409);
            expect(r.error).toMatch(/Stripe onboarding/);
        }
    });
    it("keeps other database errors generic, including a plain RAISE EXCEPTION (P0001)", async () => {
        const r = await decideCampaign(clientFailing("XX000", "secret internals"), form({campaignId: ID, intent: "approve"}));
        expect(r).toEqual({ok: false, error: "Could not save the decision.", status: 500});
        const plain = await decideCampaign(clientFailing("P0001", "internal detail"), form({campaignId: ID, intent: "approve"}));
        expect(plain).toEqual({ok: false, error: "Could not save the decision.", status: 500});
    });
});
