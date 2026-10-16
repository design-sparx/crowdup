import {describe, expect, it} from "vitest";
import {createDraft, updateCampaign, uploadCover} from "./ownerCampaigns";
import type {CampaignValues} from "../../lib/campaigns/form";
import type {SupabaseClient} from "@supabase/supabase-js";

const values: CampaignValues = {
    title: "Clean water", category: "Community", country: "KE", description: "", goalAmount: 1000,
    endDate: null, story: {type: "doc", content: []},
};

/** Fake insert builder: fails with a unique violation `conflicts` times, then succeeds. */
function insertClient(conflicts: number) {
    const slugs: string[] = [];
    let left = conflicts;
    const client = {
        from: () => ({
            insert: (row: {slug: string}) => {
                slugs.push(row.slug);
                const result = left-- > 0
                    ? {data: null, error: {code: "23505", message: "duplicate"}}
                    : {data: {id: "new-id"}, error: null};
                return {select: () => ({single: () => Promise.resolve(result)})};
            },
        }),
    } as unknown as SupabaseClient;
    return {client, slugs};
}

describe("createDraft", () => {
    it("uses the plain slug when it is free", async () => {
        const {client, slugs} = insertClient(0);
        expect(await createDraft(client, "u1", values, null)).toEqual({id: "new-id"});
        expect(slugs).toEqual(["clean-water"]);
    });
    it("retries with a suffixed slug when the slug is taken", async () => {
        const {client, slugs} = insertClient(1);
        await createDraft(client, "u1", values, null);
        expect(slugs[0]).toBe("clean-water");
        expect(slugs[1]).toMatch(/^clean-water-[0-9a-f]{6}$/);
    });
    it("gives up after repeated conflicts", async () => {
        const {client} = insertClient(10);
        await expect(createDraft(client, "u1", values, null)).rejects.toThrow(/unique/i);
    });
});

describe("updateCampaign", () => {
    function updateClient(rows: unknown[]) {
        const patches: Record<string, unknown>[] = [];
        const client = {
            from: () => ({
                update: (patch: Record<string, unknown>) => {
                    patches.push(patch);
                    const b = {eq: () => b, select: () => Promise.resolve({data: rows, error: null})};
                    return b;
                },
            }),
        } as unknown as SupabaseClient;
        return {client, patches};
    }
    it("never sends slug, currency or owner", async () => {
        const {client, patches} = updateClient([{id: "c"}]);
        await updateCampaign(client, "u1", "c", values, undefined);
        expect(Object.keys(patches[0])).not.toContain("slug");
        expect(Object.keys(patches[0])).not.toContain("currency");
        expect(Object.keys(patches[0])).not.toContain("owner_id");
        expect(Object.keys(patches[0])).not.toContain("cover_image_url");
    });
    it("reports false when no row was updated (RLS filtered it out)", async () => {
        const {client} = updateClient([]);
        expect(await updateCampaign(client, "u1", "c", values, undefined)).toBe(false);
    });
});

describe("uploadCover", () => {
    it("rejects a spoofed file before calling storage", async () => {
        let called = false;
        const client = {storage: {from: () => ({upload: () => { called = true; return {error: null}; }})}} as unknown as SupabaseClient;
        const file = new File(["<html><script>alert(1)</script></html>"], "x.png", {type: "image/png"});
        const r = await uploadCover(client, "u1", file);
        expect("error" in r).toBe(true);
        expect(called).toBe(false);
    });
});
