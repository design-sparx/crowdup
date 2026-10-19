import {buildMeta} from "../helpers";
import {DetailError404Page} from "../pages";
import {getCampaignBySlug, listRecentDonors, listUpdates} from "../lib/campaigns/repository";
import {canAcceptDonations, effectiveStatus} from "../lib/campaigns/lifecycle";
import {renderStoryHtml} from "../lib/campaigns/story";
import {createPublicClient} from "../lib/supabase/server-public";
import {data, redirect} from "react-router";
import {startDonation} from "../data-access/donations/checkout.server";
import {submitReport} from "../data-access/reports/reports.server";
import type {Route} from "./+types/campaign-details";
import {CampaignDetailsPage} from "@/features/donate/campaign-details-page";

export async function action({request, params}: Route.ActionArgs) {
    const form = await request.formData();
    if (form.get("intent") === "donate") {
        const {result, headers} = await startDonation(request, params.slug, form);
        if ("redirectTo" in result) return redirect(result.redirectTo, {headers});
        return data({error: result.error}, {status: result.status, headers});
    }
    if (form.get("intent") !== "report") return data({error: "Unknown action."}, {status: 400});
    const {result, headers} = await submitReport(request, params.slug, form);
    const {status, ...body} = result;
    return data(body, {status, headers});
}

export async function loader({params, request}: Route.LoaderArgs) {
    const campaign = await getCampaignBySlug(createPublicClient(), params.slug);
    if (!campaign) {
        throw new Response("Campaign not found", {status: 404});
    }
    // Rendered on the server from the allowlisted extensions only; see lib/campaigns/story.ts.
    const client = createPublicClient();
    const updates = await listUpdates(client, campaign.id);
    // Only live campaigns are readable, so anything not accepting donations here has ended.
    const now = new Date();
    const status = effectiveStatus({status: "live", endDate: campaign.endDate}, now);
    const acceptingDonations = canAcceptDonations({status: "live", endDate: campaign.endDate}, now);
    const donors = await listRecentDonors(client, campaign.id);
    const donation = new URL(request.url).searchParams.get("donation");
    return {
        campaign,
        storyHtml: renderStoryHtml(campaign.story),
        updates,
        status,
        acceptingDonations,
        donors,
        donationReturn: donation === "success" ? ("success" as const) : donation === "cancelled" ? ("cancelled" as const) : null,
    };
}

export function meta({loaderData}: Route.MetaArgs) {
    if (!loaderData) {
        return buildMeta({title: "Campaign not found", description: "This campaign does not exist or is not live."});
    }
    const {campaign} = loaderData;
    return buildMeta({
        title: campaign.title,
        description: campaign.description,
        image: campaign.imageUrl ?? "/vite.svg",
    });
}

export default function CampaignDetails({loaderData}: Route.ComponentProps) {
    return (
        <CampaignDetailsPage
            campaign={loaderData.campaign}
            storyHtml={loaderData.storyHtml}
            updates={loaderData.updates}
            donors={loaderData.donors}
            ended={loaderData.status === "ended"}
            acceptingDonations={loaderData.acceptingDonations}
            donationReturn={loaderData.donationReturn}
        />
    );
}

export {DetailError404Page as ErrorBoundary};
