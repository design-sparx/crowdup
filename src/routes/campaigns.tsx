import {buildMeta} from "../helpers";
import {CampaignsPage} from "../pages";
import {DEFAULT_PAGE_SIZE, listCampaigns, listCategories} from "../lib/campaigns/repository";
import {parseCampaignSearch} from "../lib/campaigns/params";
import {createPublicClient} from "../lib/supabase/server-public";
import type {Route} from "./+types/campaigns";

export async function loader({request}: Route.LoaderArgs) {
    const search = parseCampaignSearch(new URL(request.url).searchParams);
    const client = createPublicClient();
    const [{items, total}, categories] = await Promise.all([
        listCampaigns(client, search),
        listCategories(client),
    ]);
    return {items, total, categories, search, pageSize: DEFAULT_PAGE_SIZE};
}

export function meta() {
    return buildMeta({
        title: "Discover campaigns to fund",
        description: "Browse and search live fundraisers by keyword, category and country.",
        image: "/vite.svg",
    });
}

export default function Campaigns({loaderData}: Route.ComponentProps) {
    return <CampaignsPage {...loaderData}/>;
}
