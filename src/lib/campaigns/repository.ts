import type {SupabaseClient} from "@supabase/supabase-js";
import {buildKeywordFilter, type CampaignSearch} from "./params";
import type {Campaign, CampaignDetails} from "./types";

/** Any Supabase client works; callers inject the one for their context (and tests a fake). */
export type CampaignClient = SupabaseClient;

export const DEFAULT_PAGE_SIZE = 12;

interface CampaignRow {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    country: string;
    cover_image_url: string | null;
    goal_amount: number;
    currency: string;
    end_date: string | null;
    created_at: string;
    owner_id: string;
    story?: unknown;
}

interface TotalsRow {
    campaign_id: string;
    raised_amount: number;
    donor_count: number;
}

interface ProfileRow {
    id: string;
    display_name: string;
    avatar_url: string | null;
}

const LIST_COLUMNS =
    "id, slug, title, description, category, country, cover_image_url, goal_amount, currency, end_date, created_at, owner_id";

function fail(error: {message: string}): never {
    throw new Error(error.message);
}

/** Attaches totals and organiser names. Both live in views, which PostgREST cannot embed. */
async function hydrate(client: CampaignClient, rows: CampaignRow[]): Promise<Campaign[]> {
    if (rows.length === 0) return [];

    const totalsRes = await client
        .from("campaign_totals")
        .select("campaign_id, raised_amount, donor_count")
        .in("campaign_id", rows.map((r) => r.id));
    if (totalsRes.error) fail(totalsRes.error);

    const profilesRes = await client
        .from("public_profile")
        .select("id, display_name, avatar_url")
        .in("id", [...new Set(rows.map((r) => r.owner_id))]);
    if (profilesRes.error) fail(profilesRes.error);

    const totals = new Map((totalsRes.data as TotalsRow[]).map((t) => [t.campaign_id, t]));
    const profiles = new Map((profilesRes.data as ProfileRow[]).map((p) => [p.id, p]));

    return rows.map((r) => {
        const raised = Number(totals.get(r.id)?.raised_amount ?? 0);
        const goal = Number(r.goal_amount);
        return {
            id: r.id,
            slug: r.slug,
            title: r.title,
            description: r.description,
            category: r.category,
            country: r.country,
            imageUrl: r.cover_image_url,
            goalAmount: goal,
            raisedAmount: raised,
            donorCount: Number(totals.get(r.id)?.donor_count ?? 0),
            currency: r.currency,
            endDate: r.end_date,
            createdAt: r.created_at,
            organizerName: profiles.get(r.owner_id)?.display_name ?? "Anonymous",
            organizerAvatarUrl: profiles.get(r.owner_id)?.avatar_url ?? null,
            percentFunded: goal > 0 ? Math.min(100, Math.floor((raised / goal) * 100)) : 0,
        };
    });
}

export async function listCampaigns(
    client: CampaignClient,
    search: CampaignSearch,
    {pageSize = DEFAULT_PAGE_SIZE}: {pageSize?: number} = {},
): Promise<{items: Campaign[]; total: number}> {
    let query = client
        .from("campaign")
        .select(LIST_COLUMNS, {count: "exact"})
        .eq("status", "live");
    if (search.category) query = query.eq("category", search.category);
    if (search.country) query = query.eq("country", search.country);
    if (search.q) query = query.or(buildKeywordFilter(search.q));

    const from = (search.page - 1) * pageSize;
    const {data, error, count} = await query
        .order("published_at", {ascending: false})
        .range(from, from + pageSize - 1);
    if (error) fail(error);

    const rows = (data ?? []) as CampaignRow[];
    return {items: await hydrate(client, rows), total: count ?? rows.length};
}

export async function getCampaignBySlug(
    client: CampaignClient,
    slug: string,
): Promise<CampaignDetails | null> {
    const {data, error} = await client
        .from("campaign")
        .select(`${LIST_COLUMNS}, story`)
        .eq("slug", slug)
        .eq("status", "live")
        .maybeSingle();
    if (error) fail(error);
    if (!data) return null;

    const row = data as CampaignRow;
    const [campaign] = await hydrate(client, [row]);
    return {...campaign, story: row.story};
}

export async function listCategories(client: CampaignClient): Promise<string[]> {
    const {data, error} = await client.from("campaign").select("category").eq("status", "live");
    if (error) fail(error);
    return [...new Set((data as {category: string}[]).map((r) => r.category))].sort();
}
