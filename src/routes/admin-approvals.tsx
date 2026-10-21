import {buildMeta} from "../helpers";
import {useActionData, useLoaderData, data, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {decideCampaign, listPendingCampaigns} from "../data-access/campaigns/approval.server";
import {getAdminContext} from "../data-access/reports/reports.server";
import {DEMO_DISABLED_MESSAGE, demoBlocksCampaign} from "../lib/demo/guard";
import {ApprovalsTab} from "@/features/admin/approvals-tab";

// Loaders run in parallel with the layout's, so this checks the role itself.
export async function loader({request}: LoaderFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    const campaigns = await listPendingCampaigns(admin.supabase);
    return data({campaigns}, {headers: admin.headers});
}

export async function action({request}: ActionFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    const form = await request.formData();
    const campaignId = form.get("campaignId");
    if (typeof campaignId === "string" && demoBlocksCampaign(process.env, campaignId)) {
        return data({error: DEMO_DISABLED_MESSAGE}, {status: 403, headers: admin.headers});
    }
    const result = await decideCampaign(admin.supabase, form);
    if (!result.ok) return data({error: result.error}, {status: result.status, headers: admin.headers});
    return data({ok: true, message: result.message}, {headers: admin.headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    const {campaigns} = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>() as {error?: string; message?: string} | undefined;
    return (
        <div className="space-y-4">
            {actionData?.error ? <p role="alert" className="text-sm text-destructive">{actionData.error}</p> : null}
            {actionData?.message ? <p role="status" className="text-sm">{actionData.message}</p> : null}
            <ApprovalsTab campaigns={campaigns}/>
        </div>
    );
}

export function meta() {
    return buildMeta({title: "Admin: approvals", description: "Approve campaigns awaiting review."});
}
