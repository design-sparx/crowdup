import {describe, expect, it} from "vitest";
import type {SupabaseClient} from "@supabase/supabase-js";
import {closeCampaign, postUpdate} from "./ownerCampaigns";

describe("closeCampaign", () => {
    function closeClient(rows: unknown[]) {
        const calls: Record<string, unknown> = {};
        const q: Record<string, unknown> = {};
        q.eq = (col: string, v: unknown) => {
            calls[col] = v;
            return q;
        };
        q.select = () => Promise.resolve({data: rows, error: null});
        const client = {
            from: () => ({
                update: (patch: unknown) => {
                    calls.patch = patch;
                    return q;
                },
            }),
        } as unknown as SupabaseClient;
        return {client, calls};
    }
    it("only moves a live campaign of the owner to closed", async () => {
        const {client, calls} = closeClient([{id: "c1"}]);
        expect(await closeCampaign(client, "u1", "c1")).toBe(true);
        expect(calls).toMatchObject({patch: {status: "closed"}, id: "c1", owner_id: "u1", status: "live"});
    });
    it("returns false when RLS or the filter matched nothing", async () => {
        const {client} = closeClient([]);
        expect(await closeCampaign(client, "u1", "c1")).toBe(false);
    });
});

describe("postUpdate", () => {
    it("inserts as the signed-in user", async () => {
        let row: unknown;
        const client = {
            from: () => ({
                insert: (r: unknown) => {
                    row = r;
                    return Promise.resolve({error: null});
                },
            }),
        } as unknown as SupabaseClient;
        await postUpdate(client, "u1", "c1", "Hello");
        expect(row).toEqual({campaign_id: "c1", author_id: "u1", body: "Hello"});
    });
    it("surfaces the Postgres error code (RLS rejection)", async () => {
        const client = {
            from: () => ({insert: () => Promise.resolve({error: {message: "rls", code: "42501"}})}),
        } as unknown as SupabaseClient;
        await expect(postUpdate(client, "u1", "c1", "Hi")).rejects.toMatchObject({code: "42501"});
    });
});
