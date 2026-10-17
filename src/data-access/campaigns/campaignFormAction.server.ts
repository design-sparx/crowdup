import {data, redirect} from "react-router";
import type {SupabaseClient} from "@supabase/supabase-js";
import {parseCampaignForm, type CampaignFormErrors} from "../../lib/campaigns/form";
import {liveEditPlan} from "../../lib/campaigns/liveEdit";
import {getOwnSuspension} from "../moderation/moderation.server";
import {getPublishingMode} from "../stripe/connect.server";
import {createServiceRoleClient} from "../stripe/serviceRole.server";
import {
    createDraft,
    getOwnCampaign,
    INSUFFICIENT_PRIVILEGE,
    updateCampaign,
    updateLiveCampaign,
    uploadCover,
} from "./ownerCampaigns";

type ActionErrors = CampaignFormErrors & {form?: string; cover?: string};

function invalid(errors: ActionErrors, headers: Headers, status = 400) {
    return data({errors}, {status, headers});
}

function isPrivilegeError(e: unknown): boolean {
    return (e as {code?: string})?.code === INSUFFICIENT_PRIVILEGE;
}

const SUSPENDED_MESSAGE = "Your account cannot create or edit campaigns right now.";

/**
 * Shared create/edit action. `campaignId` is set when editing. All writes use the
 * cookie-bound client, so RLS decides whether the caller may do them.
 */
export async function handleCampaignForm(args: {
    request: Request;
    supabase: SupabaseClient;
    userId: string;
    headers: Headers;
    campaignId?: string;
}) {
    const {request, supabase, userId, headers, campaignId} = args;
    const form = await request.formData();
    // The goal is parsed in the campaign's own currency, which is only known once it has gone live.
    const existing = campaignId ? await getOwnCampaign(supabase, userId, campaignId) : null;
    const parsed = parseCampaignForm(form, {currency: existing?.currency ?? null});
    if (!parsed.ok) return invalid(parsed.errors, headers);

    try {
        let coverUrl: string | undefined;
        const cover = form.get("cover");
        if (cover instanceof File && cover.size > 0) {
            const uploaded = await uploadCover(supabase, userId, cover);
            if ("error" in uploaded) return invalid({cover: uploaded.error}, headers);
            coverUrl = uploaded.url;
        }

        if (!campaignId) {
            const {id} = await createDraft(supabase, userId, parsed.values, coverUrl ?? null);
            return redirect(`/campaigns/${id}/edit?saved=1`, {headers});
        }

        if (existing?.status === "live") {
            // The database does not let a client change what an admin approved, so a live
            // campaign is edited by the server, which re-checks ownership and the account.
            if ((await getOwnSuspension(supabase, userId)).suspended) {
                return invalid({form: SUSPENDED_MESSAGE}, headers, 403);
            }
            const plan = liveEditPlan(existing, {...parsed.values, coverImageUrl: coverUrl}, getPublishingMode());
            const ok = await updateLiveCampaign(
                createServiceRoleClient(), userId, campaignId as string, parsed.values, coverUrl, plan.nextStatus,
                existing.updatedAt,
            );
            if (!ok) {
                return invalid({form: "This campaign changed while you were editing. Reload the page and try again."}, headers, 409);
            }
            return redirect(`/campaigns/${campaignId}/edit?saved=1`, {headers});
        }

        const updated = await updateCampaign(supabase, userId, campaignId, parsed.values, coverUrl, {
            reopenRejected: existing?.status === "rejected",
            expectedStatus: existing?.status,
        });
        if (!updated) return invalid({form: "This campaign cannot be edited."}, headers, 403);
        return redirect(`/campaigns/${campaignId}/edit?saved=1`, {headers});
    } catch (e) {
        if (isPrivilegeError(e)) return invalid({form: SUSPENDED_MESSAGE}, headers, 403);
        throw e;
    }
}
