import type {SupabaseClient} from "@supabase/supabase-js";
import {COVER_BUCKET, coverPath, validateCover} from "../../lib/campaigns/cover";
import type {CampaignValues} from "../../lib/campaigns/form";
import {slugify, withSuffix} from "../../lib/campaigns/slug";

/**
 * Owner-side campaign access. Always called with the cookie-bound client from
 * `createSupabaseServerClient`, so row-level security applies as the signed-in user.
 * Ownership is enforced by RLS, not by checks here; `getOwnCampaign` only ever returns
 * rows the policies allow (own campaigns, plus live campaigns of others, which we filter out).
 */

export interface OwnCampaign extends CampaignValues {
    id: string;
    /** Null for a draft created before Stripe onboarding; set (and fixed) at go-live. */
    currency: string | null;
    slug: string;
    status: string;
    coverImageUrl: string | null;
}

interface Row {
    id: string;
    owner_id: string;
    slug: string;
    status: string;
    title: string;
    category: string;
    country: string;
    description: string;
    goal_amount: number;
    currency: string | null;
    end_date: string | null;
    cover_image_url: string | null;
    story: unknown;
}

const COLUMNS =
    "id, owner_id, slug, status, title, category, country, description, goal_amount, currency, end_date, cover_image_url, story";

const UNIQUE_VIOLATION = "23505";

/** Postgres code for insufficient privilege (RLS rejection, e.g. a suspended user). */
export const INSUFFICIENT_PRIVILEGE = "42501";

function fail(error: {message: string; code?: string}): never {
    throw Object.assign(new Error(error.message), {code: error.code});
}

export async function getOwnCampaign(
    client: SupabaseClient,
    userId: string,
    id: string,
): Promise<OwnCampaign | null> {
    const {data, error} = await client
        .from("campaign")
        .select(COLUMNS)
        .eq("id", id)
        .eq("owner_id", userId)
        .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const r = data as Row;
    return {
        id: r.id,
        slug: r.slug,
        status: r.status,
        title: r.title,
        category: r.category,
        country: r.country,
        description: r.description,
        goalAmount: Number(r.goal_amount),
        currency: r.currency,
        endDate: r.end_date,
        coverImageUrl: r.cover_image_url,
        story: r.story as OwnCampaign["story"],
    };
}

/** Uploads a validated cover image under the user's folder and returns its public URL. */
export async function uploadCover(
    client: SupabaseClient,
    userId: string,
    file: File,
): Promise<{url: string} | {error: string}> {
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const check = validateCover({declaredType: file.type, size: file.size, head});
    if (!check.ok) return {error: check.error};

    const path = coverPath(userId, check.extension, crypto.randomUUID());
    const {error} = await client.storage
        .from(COVER_BUCKET)
        .upload(path, file, {contentType: check.type, upsert: false});
    if (error) return {error: "The cover image could not be uploaded."};
    return {url: client.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl};
}

function randomSuffix(): string {
    return crypto.randomUUID().slice(0, 6);
}

/** Creates a draft. Retries with a random suffix when the slug is taken. */
export async function createDraft(
    client: SupabaseClient,
    userId: string,
    values: CampaignValues,
    coverImageUrl: string | null,
): Promise<{id: string}> {
    const base = slugify(values.title);
    for (let attempt = 0; attempt < 4; attempt++) {
        const slug = attempt === 0 ? base : withSuffix(base, randomSuffix());
        const {data, error} = await client
            .from("campaign")
            .insert({
                owner_id: userId,
                title: values.title,
                slug,
                category: values.category,
                country: values.country,
                description: values.description,
                goal_amount: values.goalAmount,
                end_date: values.endDate,
                story: values.story,
                cover_image_url: coverImageUrl,
            })
            .select("id")
            .single();
        if (!error) return {id: (data as {id: string}).id};
        if (error.code !== UNIQUE_VIOLATION) fail(error);
    }
    throw new Error("Could not generate a unique campaign address. Try a different title.");
}

/**
 * Updates the editable fields. Slug and currency are deliberately untouched: the slug is
 * the public address and the currency comes from the Stripe account at go-live. Returns false when RLS
 * filtered the row out (not the owner, suspended user, suspended campaign).
 */
export async function updateCampaign(
    client: SupabaseClient,
    userId: string,
    id: string,
    values: CampaignValues,
    coverImageUrl: string | undefined,
): Promise<boolean> {
    const patch: Record<string, unknown> = {
        title: values.title,
        category: values.category,
        country: values.country,
        description: values.description,
        goal_amount: values.goalAmount,
        end_date: values.endDate,
        story: values.story,
    };
    if (coverImageUrl !== undefined) patch.cover_image_url = coverImageUrl;

    const {data, error} = await client
        .from("campaign")
        .update(patch)
        .eq("id", id)
        .eq("owner_id", userId)
        .select("id");
    if (error) fail(error);
    return (data ?? []).length > 0;
}

/**
 * Closes a live campaign. The filters are a courtesy; RLS and the write guard trigger are
 * the enforcement (owner only, live -> closed only). Returns false when nothing matched.
 */
export async function closeCampaign(client: SupabaseClient, userId: string, id: string): Promise<boolean> {
    const {data, error} = await client
        .from("campaign")
        .update({status: "closed"})
        .eq("id", id)
        .eq("owner_id", userId)
        .eq("status", "live")
        .select("id");
    if (error) fail(error);
    return (data ?? []).length > 0;
}

/** Posts a plain-text update. RLS requires the owner of a live or closed campaign. */
export async function postUpdate(
    client: SupabaseClient,
    userId: string,
    campaignId: string,
    body: string,
): Promise<void> {
    const {error} = await client
        .from("campaign_update")
        .insert({campaign_id: campaignId, author_id: userId, body});
    if (error) fail(error);
}

export async function listOwnCampaigns(client: SupabaseClient, userId: string) {
    const {data, error} = await client
        .from("campaign")
        .select("id, slug, title, status")
        .eq("owner_id", userId)
        .order("created_at", {ascending: false});
    if (error) fail(error);
    return data as {id: string; slug: string; title: string; status: string}[];
}
