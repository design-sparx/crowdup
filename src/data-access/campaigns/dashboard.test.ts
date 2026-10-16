import {describe, expect, it} from "vitest";
import type {SupabaseClient} from "@supabase/supabase-js";
import {getDashboardData} from "./dashboard";

function fakeClient(campaigns: unknown[], donations: unknown[]) {
    const calls: string[] = [];
    const chain = (table: string, data: unknown[]) => {
        const q: Record<string, unknown> = {};
        for (const m of ["select", "eq", "in", "order", "limit"]) q[m] = () => q;
        q.then = (resolve: (v: unknown) => void) => {
            calls.push(table);
            resolve({data, error: null});
        };
        return q;
    };
    const client = {
        from: (t: string) => chain(t, t === "campaign" ? campaigns : donations),
    } as unknown as SupabaseClient;
    return {client, calls};
}

describe("getDashboardData", () => {
    it("skips the donation query when the organiser has no campaigns", async () => {
        const {client, calls} = fakeClient([], []);
        expect(await getDashboardData(client, "u1")).toEqual({campaigns: [], donations: []});
        expect(calls).toEqual(["campaign"]);
    });
    it("maps rows and drops donor names for anonymous donations", async () => {
        const {client} = fakeClient(
            [{id: "c1", slug: "s", title: "T", status: "draft", currency: "KES", goal_amount: "100"}],
            [{id: "d1", campaign_id: "c1", amount: "50", currency: "KES", created_at: "2026-10-10T00:00:00Z",
                anonymous: true, donor_name: "Leak"}],
        );
        const r = await getDashboardData(client, "u1");
        expect(r.campaigns[0]).toMatchObject({goalAmount: 100, status: "draft"});
        expect(r.donations[0]).toMatchObject({amount: 50, anonymous: true, donorName: null});
    });
});
