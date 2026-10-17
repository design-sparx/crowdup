import {data} from "react-router";
import {ComingSoonPage} from "../pages";
import {requireUserClient} from "../data-access/auth/auth.server";
import {
    closeCampaign,
    getOwnCampaign,
    INSUFFICIENT_PRIVILEGE,
    postUpdate,
} from "../data-access/campaigns/ownerCampaigns";
import {handleCampaignForm} from "../data-access/campaigns/campaignFormAction.server";
import {getOwnSuspension} from "../data-access/moderation/moderation.server";
import {campaignSuspensionNotice, userSuspensionNotice} from "../lib/moderation/moderation";
import {listUpdates} from "../lib/campaigns/repository";
import {parseUpdateBody} from "../lib/campaigns/updates";
import type {Route} from "./+types/edit-campaign";

export async function loader({request, params}: Route.LoaderArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const campaign = await getOwnCampaign(supabase, user.id, params.id);
    // Same 404 for "does not exist" and "not yours", so ids cannot be probed.
    if (!campaign) throw new Response("Campaign not found", {status: 404, headers});
    const saved = new URL(request.url).searchParams.get("saved") === "1";
    const publish = new URL(request.url).searchParams.get("publish");
    const updates = await listUpdates(supabase, campaign.id);
    const own = await getOwnSuspension(supabase, user.id);
    const notice =
        campaignSuspensionNotice(campaign.status, campaign.suspendedReason) ??
        userSuspensionNotice(own.suspended, own.reason);
    return data({campaign, saved, publish, updates, moderationNotice: notice}, {headers});
}

export async function action({request, params}: Route.ActionArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const form = await request.clone().formData();
    const intent = form.get("intent");

    if (intent === "close" || intent === "post-update") {
        try {
            if (intent === "close") {
                const ok = await closeCampaign(supabase, user.id, params.id);
                if (!ok) return data({lifecycleError: "This campaign cannot be closed."}, {status: 403, headers});
                return data({lifecycleNotice: "Campaign closed."}, {headers});
            }
            const parsed = parseUpdateBody(form.get("body"));
            if (!parsed.ok) return data({lifecycleError: parsed.error}, {status: 400, headers});
            await postUpdate(supabase, user.id, params.id, parsed.body);
            return data({lifecycleNotice: "Update posted."}, {headers});
        } catch (e) {
            if ((e as {code?: string}).code === INSUFFICIENT_PRIVILEGE) {
                return data({lifecycleError: "You cannot do that on this campaign."}, {status: 403, headers});
            }
            throw e;
        }
    }

    return handleCampaignForm({request, supabase, userId: user.id, headers, campaignId: params.id});
}

export default function EditCampaign() {
    return <ComingSoonPage title="Edit campaign"/>;
}

export {Error404Page as ErrorBoundary} from "../pages";
