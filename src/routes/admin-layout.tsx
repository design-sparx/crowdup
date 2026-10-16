import {data, type LoaderFunctionArgs} from "react-router";
import {countPendingCampaigns} from "../data-access/campaigns/approval.server";
import {getAdminContext, listOpenReportGroups} from "../data-access/reports/reports.server";

/**
 * Gate for every /admin route. Non-admins and guests get a 404 (not a redirect), so the
 * area does not reveal itself. Child loaders re-check, since loaders run in parallel.
 */
export async function loader({request}: LoaderFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    const [{openCount}, pendingCount] = await Promise.all([
        listOpenReportGroups(admin.supabase),
        countPendingCampaigns(admin.supabase),
    ]);
    return data({openCount, pendingCount}, {headers: admin.headers});
}

export {AdminLayout as default} from "../layout";
export {Error404Page as ErrorBoundary} from "../pages";
