import {buildMeta} from "../helpers";
import {CampaignDetailsPage, DetailError404Page} from "../pages";
import {getCampaignBySlug} from "../lib/campaigns/repository";
import {createPublicClient} from "../lib/supabase/server-public";
import {data} from "react-router";
import {submitReport} from "../data-access/reports/reports.server";
import type {Route} from "./+types/campaign-details";

export async function action({request, params}: Route.ActionArgs) {
    const form = await request.formData();
    if (form.get("intent") !== "report") return data({error: "Unknown action."}, {status: 400});
    const {result, headers} = await submitReport(request, params.slug, form);
    const {status, ...body} = result;
    return data(body, {status, headers});
}

export async function loader({params}: Route.LoaderArgs) {
    const campaign = await getCampaignBySlug(createPublicClient(), params.slug);
    if (!campaign) {
        throw new Response("Campaign not found", {status: 404});
    }
    return {campaign};
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
    return <CampaignDetailsPage campaign={loaderData.campaign}/>;
}

export {DetailError404Page as ErrorBoundary};
