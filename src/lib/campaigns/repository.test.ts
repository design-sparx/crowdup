import {describe, expect, it} from "vitest";
import {getCampaignBySlug, listCampaigns, listCategories, type CampaignClient} from "./repository";

type Call = [string, ...unknown[]];

/** Records the query builder calls and resolves to a canned result. */
interface Result {
    data: unknown;
    error: {message: string} | null;
    count?: number | null;
}

/** Views are queried separately (PostgREST cannot embed them), so results are per table. */
function fakeClient(campaign: Result, others: Record<string, unknown[]> = {}) {
    const calls: Call[] = [];
    const tables: string[] = [];
    const client = {
        from: (t: string) => {
            tables.push(t);
            const result: Result = t === "campaign" ? campaign : {data: others[t] ?? [], error: null};
            const builder: Record<string, unknown> = {};
            for (const m of ["select", "eq", "in", "or", "order", "range", "limit"]) {
                builder[m] = (...args: unknown[]) => {
                    calls.push([t === "campaign" ? m : `${t}.${m}`, ...args]);
                    return builder;
                };
            }
            builder.maybeSingle = () => Promise.resolve(result);
            builder.then = (resolve: (v: unknown) => unknown) => resolve(result);
            return builder;
        },
    } as unknown as CampaignClient;
    return {client, calls, tables};
}

const row = {
    id: "c1",
    slug: "clean-water",
    title: "Clean water",
    description: "Taps",
    category: "Community",
    country: "KE",
    cover_image_url: "https://x/y.jpg",
    goal_amount: 500000,
    currency: "KES",
    end_date: null,
    created_at: "2026-01-01T00:00:00Z",
    published_at: "2026-01-02T00:00:00Z",
    story: {type: "doc", content: []},
    owner_id: "u1",
};
const owner = {id: "u1", display_name: "Amara", avatar_url: null};
const totals = {campaign_id: "c1", raised_amount: 40000, donor_count: 3};
const views = {public_profile: [owner], campaign_totals: [totals]};

describe("listCampaigns", () => {
    it("only queries live campaigns and maps rows to the campaign shape", async () => {
        const {client, calls, tables} = fakeClient({data: [row], error: null, count: 1}, views);
        const result = await listCampaigns(client, {page: 1});
        expect(tables).toEqual(["campaign", "campaign_totals", "public_profile"]);
        expect(calls).toContainEqual(["eq", "status", "live"]);
        expect(result.total).toBe(1);
        expect(result.items[0]).toMatchObject({
            id: "c1",
            slug: "clean-water",
            imageUrl: "https://x/y.jpg",
            goalAmount: 500000,
            raisedAmount: 40000,
            donorCount: 3,
            organizerName: "Amara",
            percentFunded: 8,
        });
    });

    it("applies category, country and keyword filters", async () => {
        const {client, calls} = fakeClient({data: [], error: null, count: 0});
        await listCampaigns(client, {page: 1, q: "water", category: "Community", country: "KE"});
        expect(calls).toContainEqual(["eq", "category", "Community"]);
        expect(calls).toContainEqual(["eq", "country", "KE"]);
        expect(calls).toContainEqual(["or", "title.ilike.*water*,description.ilike.*water*"]);
    });

    it("pages with a range", async () => {
        const {client, calls} = fakeClient({data: [], error: null, count: 0});
        await listCampaigns(client, {page: 3}, {pageSize: 12});
        expect(calls).toContainEqual(["range", 24, 35]);
    });

    it("treats missing totals as zero and caps percent at 100", async () => {
        const none = {...row, id: "c2", slug: "other"};
        const {client} = fakeClient(
            {data: [row, none], error: null, count: 2},
            {public_profile: [owner], campaign_totals: [{...totals, raised_amount: 900000}]},
        );
        const {items} = await listCampaigns(client, {page: 1});
        expect(items[0].percentFunded).toBe(100);
        expect(items[1]).toMatchObject({raisedAmount: 0, donorCount: 0, percentFunded: 0});
    });

    it("throws on a database error", async () => {
        const {client} = fakeClient({data: null, error: {message: "boom"}});
        await expect(listCampaigns(client, {page: 1})).rejects.toThrow("boom");
    });
});

describe("getCampaignBySlug", () => {
    it("returns null when nothing is found", async () => {
        const {client, calls} = fakeClient({data: null, error: null});
        expect(await getCampaignBySlug(client, "nope")).toBeNull();
        expect(calls).toContainEqual(["eq", "slug", "nope"]);
        expect(calls).toContainEqual(["eq", "status", "live"]);
    });

    it("returns the mapped campaign with its story", async () => {
        const {client} = fakeClient({data: row, error: null}, views);
        const c = await getCampaignBySlug(client, "clean-water");
        expect(c?.title).toBe("Clean water");
        expect(c?.organizerName).toBe("Amara");
        expect(c?.story).toEqual({type: "doc", content: []});
    });
});

describe("listCategories", () => {
    it("returns distinct categories of live campaigns, sorted", async () => {
        const {client} = fakeClient({
            data: [{category: "Sports"}, {category: "Community"}, {category: "Sports"}],
            error: null,
        });
        expect(await listCategories(client)).toEqual(["Community", "Sports"]);
    });
});
