import {buildMeta} from "../helpers";
import {ComingSoonPage} from "../pages";
import {listCampaigns} from "../lib/campaigns/repository";
import {createPublicClient} from "../lib/supabase/server-public";

export async function loader() {
    const {items} = await listCampaigns(createPublicClient(), {page: 1}, {pageSize: 8});
    return {campaigns: items};
}

export function meta() {
    return buildMeta({
        title: "Crowdfunding for causes that matter",
        description:
            "CrowdUp helps you raise funds for personal projects, charities and NGOs. Start a fundraiser and receive donations from people who care.",
        image: "/vite.svg",
    });
}

export default function Home() {
    return <ComingSoonPage title="CrowdUp"/>;
}
