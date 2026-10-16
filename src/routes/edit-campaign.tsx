import {data} from "react-router";
import {CampaignLifecyclePanel} from "../components";
import {CreateCampaignPage} from "../pages";
import {requireUserClient} from "../data-access/auth/auth.server";
import {
    closeCampaign,
    getOwnCampaign,
    INSUFFICIENT_PRIVILEGE,
    postUpdate,
} from "../data-access/campaigns/ownerCampaigns";
import {handleCampaignForm} from "../data-access/campaigns/campaignFormAction.server";
import {listUpdates} from "../lib/campaigns/repository";
import {parseUpdateBody} from "../lib/campaigns/updates";
import type {Route} from "./+types/edit-campaign";

export async function loader({request, params}: Route.LoaderArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const campaign = await getOwnCampaign(supabase, user.id, params.id);
    // Same 404 for "does not exist" and "not yours", so ids cannot be probed.
    if (!campaign) throw new Response("Campaign not found", {status: 404, headers});
    const saved = new URL(request.url).searchParams.get("saved") === "1";
    const updates = await listUpdates(supabase, campaign.id);
    return data({campaign, saved, updates}, {headers});
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

export default function EditCampaign({loaderData, actionData}: Route.ComponentProps) {
    const {campaign, saved, updates} = loaderData;
    const result = actionData as
        | {errors?: Record<string, string>; lifecycleNotice?: string; lifecycleError?: string}
        | undefined;
    // The loader revalidates after each action, so the status shown is already current.
    return (
        <>
            <CreateCampaignPage
                mode="edit"
                status={campaign.status}
                saved={saved}
                errors={result?.errors}
                values={{
                    title: campaign.title,
                    category: campaign.category,
                    country: campaign.country,
                    description: campaign.description,
                    goal: String(campaign.goalAmount / 100),
                    currency: campaign.currency,
                    endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : "",
                    story: campaign.story,
                    coverImageUrl: campaign.coverImageUrl,
                }}
            />
            {campaign.status !== "draft" && (
                <CampaignLifecyclePanel
                    status={campaign.status}
                    updates={updates}
                    notice={result?.lifecycleNotice}
                    error={result?.lifecycleError}
                />
            )}
        </>
    );
}

export {Error404Page as ErrorBoundary} from "../pages";
