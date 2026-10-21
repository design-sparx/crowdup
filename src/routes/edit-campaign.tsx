import {buildMeta} from "../helpers";
import {data, useActionData, useLoaderData} from "react-router";
import {ManageCampaignPage} from "@/features/organiser/manage-campaign-page";
import type {PublishOutcome} from "@/features/organiser/publish-result";
import {campaignPageUrl} from "../lib/campaigns/campaign-url";
import {readConnectSummary} from "../data-access/stripe/connect.server";
import {goalToInput} from "../lib/campaigns/goal";
import {listRecentDonors} from "../lib/campaigns/repository";
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
import {DEMO_DISABLED_MESSAGE, demoBlocksCampaign} from "../lib/demo/guard";
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
    const connect = await readConnectSummary(supabase, user.id);
    const donors = await listRecentDonors(supabase, campaign.id);
    const publicUrl = campaignPageUrl(campaign.slug, process.env.SITE_URL, request.url, process.env.NODE_ENV === "production");
    return data({campaign, saved, publish, updates, moderationNotice: notice, connect, publicUrl, donors}, {headers});
}

export async function action({request, params}: Route.ActionArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const form = await request.clone().formData();
    const intent = form.get("intent");

    if (demoBlocksCampaign(process.env, params.id)) {
        return data({lifecycleError: DEMO_DISABLED_MESSAGE, errors: {form: DEMO_DISABLED_MESSAGE}}, {status: 403, headers});
    }

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

const PUBLISH_OUTCOMES: readonly PublishOutcome[] = ["live", "awaiting_approval", "not_connected", "bad_goal"];

export default function EditCampaign() {
    const {campaign, saved, publish, updates, moderationNotice, connect, publicUrl, donors} = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>() as
        | {errors?: Record<string, string | undefined>; lifecycleNotice?: string; lifecycleError?: string}
        | undefined;
    // Only the four known outcomes reach the page, so an unexpected ?publish= value is ignored.
    const outcome = PUBLISH_OUTCOMES.find((o) => o === publish) ?? null;
    return (
        <ManageCampaignPage
            campaignId={campaign.id}
            title={campaign.title}
            status={campaign.status}
            updates={updates}
            donors={donors}
            publish={outcome}
            saved={saved}
            moderationNotice={moderationNotice}
            lifecycleNotice={actionData?.lifecycleNotice ?? null}
            lifecycleError={actionData?.lifecycleError ?? null}
            formErrors={actionData?.errors ?? {}}
            currency={campaign.currency}
            stripeStatus={connect.status}
            defaults={{
                title: campaign.title,
                category: campaign.category,
                country: campaign.country,
                description: campaign.description,
                goal: goalToInput(campaign.goalAmount, campaign.currency),
                endDate: campaign.endDate ? campaign.endDate.slice(0, 10) : undefined,
                coverUrl: campaign.coverImageUrl ?? undefined,
            }}
            storyHtml=""
            publicUrl={publicUrl}
        />
    );
}

export {Error404Page as ErrorBoundary} from "../pages";

export function meta() {
    return buildMeta({title: "Edit campaign", description: "Update your campaign."});
}
