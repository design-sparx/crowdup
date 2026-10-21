import {buildMeta} from "../helpers";
import {useActionData, useLoaderData, data, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {getAdminContext} from "../data-access/reports/reports.server";
import {listAdminCampaigns, restoreCampaign, suspendCampaign} from "../data-access/moderation/moderation.server";
import {parseModerationReason} from "../lib/moderation/moderation";
import {DEMO_DISABLED_MESSAGE, demoBlocksCampaign} from "../lib/demo/guard";
import {CampaignsTab} from "@/features/admin/campaigns-tab";

export async function loader({request}: LoaderFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    return data({campaigns: await listAdminCampaigns(admin.supabase)}, {headers: admin.headers});
}

export async function action({request}: ActionFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    const form = await request.formData();
    const id = form.get("campaignId");
    const intent = form.get("intent");
    if (typeof id !== "string" || !id) return data({error: "Missing campaign."}, {status: 400, headers: admin.headers});

    if (demoBlocksCampaign(process.env, id)) {
        return data({error: DEMO_DISABLED_MESSAGE}, {status: 403, headers: admin.headers});
    }

    let result;
    if (intent === "suspend") {
        const reason = parseModerationReason(form.get("reason"));
        if (!reason.ok) return data({error: reason.error}, {status: 400, headers: admin.headers});
        result = await suspendCampaign(admin.supabase, id, reason.reason);
    } else if (intent === "restore") {
        result = await restoreCampaign(admin.supabase, id);
    } else {
        return data({error: "Unknown action."}, {status: 400, headers: admin.headers});
    }
    if (!result.ok) return data({error: result.error}, {status: result.status, headers: admin.headers});
    return data({ok: true}, {headers: admin.headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    const {campaigns} = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>() as {error?: string} | undefined;
    return (
        <div className="space-y-4">
            {actionData?.error ? <p role="alert" className="text-sm text-destructive">{actionData.error}</p> : null}
            <CampaignsTab campaigns={campaigns}/>
        </div>
    );
}

export function meta() {
    return buildMeta({title: "Admin: campaigns", description: "Manage all campaigns."});
}
