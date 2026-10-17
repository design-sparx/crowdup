import {ComingSoonPage} from "../pages";
import {data, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {decideCampaign, listPendingCampaigns} from "../data-access/campaigns/approval.server";
import {getAdminContext} from "../data-access/reports/reports.server";

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
    const result = await decideCampaign(admin.supabase, await request.formData());
    if (!result.ok) return data({error: result.error}, {status: result.status, headers: admin.headers});
    return data({ok: true, message: result.message}, {headers: admin.headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    return <ComingSoonPage title="Approvals"/>;
}
