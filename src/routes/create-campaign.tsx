import {data, useActionData, useLoaderData} from "react-router";
import {getOwnSuspension} from "../data-access/moderation/moderation.server";
import {userSuspensionNotice} from "../lib/moderation/moderation";
import {renderStoryPreview} from "../lib/campaigns/preview";
import {CreateCampaignPage} from "@/features/organiser/create-campaign-page";
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
    const {currency, moderationNotice} = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>() as {errors?: Record<string, string | undefined>} | undefined;
    return (
        <CreateCampaignPage
            currency={currency}
            errors={actionData?.errors ?? {}}
            defaults={{}}
            storyHtml=""
            notice={moderationNotice}
        />
    );
}

export {Error404Page as ErrorBoundary} from "../pages";
