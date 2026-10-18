import {data} from "react-router";
import {getOwnSuspension} from "../data-access/moderation/moderation.server";
import {userSuspensionNotice} from "../lib/moderation/moderation";
import {renderStoryPreview} from "../lib/campaigns/preview";
import {ComingSoonPage} from "../pages";
import {requireUserClient} from "../data-access/auth/auth.server";
import {readConnectSummary} from "../data-access/stripe/connect.server";
import {handleCampaignForm} from "../data-access/campaigns/campaignFormAction.server";
import type {Route} from "./+types/create-campaign";

export async function loader({request}: Route.LoaderArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const {currency} = await readConnectSummary(supabase, user.id);
    const own = await getOwnSuspension(supabase, user.id);
    return data({currency, moderationNotice: userSuspensionNotice(own.suspended, own.reason)}, {headers});
}

export async function action({request}: Route.ActionArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const form = await request.clone().formData();
    if (form.get("intent") === "preview") {
        // Renders the typed story with the published page's renderer. Nothing is saved.
        const html = renderStoryPreview(form.get("story")?.toString());
        return data({html}, {headers});
    }
    return handleCampaignForm({request, supabase, userId: user.id, headers});
}

export default function CreateCampaign() {
    return <ComingSoonPage title="Create a campaign"/>;
}

export {Error404Page as ErrorBoundary} from "../pages";
