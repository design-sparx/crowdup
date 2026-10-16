import {data, redirect} from "react-router";
import type {SupabaseClient} from "@supabase/supabase-js";
import {parseCampaignForm, type CampaignFormErrors} from "../../lib/campaigns/form";
import {createDraft, INSUFFICIENT_PRIVILEGE, updateCampaign, uploadCover} from "./ownerCampaigns";

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
    const parsed = parseCampaignForm(form, {requireCurrency: !campaignId});
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

        // updateCampaign never writes currency, so passing the full values is safe.
        const updated = await updateCampaign(supabase, userId, campaignId, parsed.values, coverUrl);
        if (!updated) return invalid({form: "This campaign cannot be edited."}, headers, 403);
        return redirect(`/campaigns/${campaignId}/edit?saved=1`, {headers});
    } catch (e) {
        if (isPrivilegeError(e)) return invalid({form: SUSPENDED_MESSAGE}, headers, 403);
        throw e;
    }
}
