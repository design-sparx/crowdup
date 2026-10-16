import {data} from "react-router";
import {CreateCampaignPage} from "../pages";
import {requireUserClient} from "../data-access/auth/auth.server";
import {readConnectSummary} from "../data-access/stripe/connect.server";
import {handleCampaignForm} from "../data-access/campaigns/campaignFormAction.server";
import type {Route} from "./+types/create-campaign";

export async function loader({request}: Route.LoaderArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const {currency} = await readConnectSummary(supabase, user.id);
    return data({currency}, {headers});
}

export async function action({request}: Route.ActionArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    return handleCampaignForm({request, supabase, userId: user.id, headers});
}

const empty = {
    title: "", category: "", country: "", description: "", goal: "", currency: null as string | null,
    endDate: "", story: {type: "doc", content: []}, coverImageUrl: null,
};

export default function CreateCampaign({loaderData, actionData}: Route.ComponentProps) {
    return (
        <CreateCampaignPage
            mode="create"
            values={{...empty, currency: loaderData.currency}}
            errors={actionData?.errors}
        />
    );
}

export {Error404Page as ErrorBoundary} from "../pages";
