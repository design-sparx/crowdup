import {data} from "react-router";
import {CreateCampaignPage} from "../pages";
import {requireUserClient} from "../data-access/auth/auth.server";
import {getOwnCampaign} from "../data-access/campaigns/ownerCampaigns";
import {handleCampaignForm} from "../data-access/campaigns/campaignFormAction.server";
import type {Route} from "./+types/edit-campaign";

export async function loader({request, params}: Route.LoaderArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const campaign = await getOwnCampaign(supabase, user.id, params.id);
    // Same 404 for "does not exist" and "not yours", so ids cannot be probed.
    if (!campaign) throw new Response("Campaign not found", {status: 404, headers});
    const saved = new URL(request.url).searchParams.get("saved") === "1";
    return data({campaign, saved}, {headers});
}

export async function action({request, params}: Route.ActionArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    return handleCampaignForm({request, supabase, userId: user.id, headers, campaignId: params.id});
}

export default function EditCampaign({loaderData, actionData}: Route.ComponentProps) {
    const {campaign, saved} = loaderData;
    return (
        <CreateCampaignPage
            mode="edit"
            status={campaign.status}
            saved={saved}
            errors={actionData?.errors}
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
    );
}

export {Error404Page as ErrorBoundary} from "../pages";
