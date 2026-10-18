import {useRouteLoaderData} from "react-router";
import {buildMeta} from "../helpers";
import {DetailError404Page} from "../pages";
import {getCampaignBySlug} from "../lib/campaigns/repository";
import {campaignPageUrl} from "../lib/campaigns/campaign-url";
import {createPublicClient} from "../lib/supabase/server-public";
import type {Route} from "./+types/campaign-thanks";
import type {loader as siteLoader} from "./site-layout";
import {ThankYouPage} from "@/features/donate/thank-you-page";

export async function loader({params, request}: Route.LoaderArgs) {
    const campaign = await getCampaignBySlug(createPublicClient(), params.slug);
    if (!campaign) {
        throw new Response("Campaign not found", {status: 404});
    }
    const campaignUrl = campaignPageUrl(campaign.slug, process.env.SITE_URL, request.url, process.env.NODE_ENV === "production");
    return {campaign: {title: campaign.title, slug: campaign.slug}, campaignUrl};
}

export function meta({loaderData}: Route.MetaArgs) {
    return buildMeta({
        title: loaderData ? `Thank you for supporting ${loaderData.campaign.title}` : "Campaign not found",
        description: "Thank you for your support.",
    });
}

export default function CampaignThanks({loaderData}: Route.ComponentProps) {
    // The site layout already looked up the signed-in person, so reuse it instead of asking again.
    const site = useRouteLoaderData<typeof siteLoader>("routes/site-layout");
    return <ThankYouPage campaign={loaderData.campaign} signedIn={Boolean(site?.account)} campaignUrl={loaderData.campaignUrl}/>;
}

export {DetailError404Page as ErrorBoundary};