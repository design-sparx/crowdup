import {data, Outlet, type LoaderFunctionArgs} from "react-router";
import {countPendingCampaigns} from "../data-access/campaigns/approval.server";
import {countOpenUnmatched} from "../data-access/payments/unmatched.server";
import {getAdminContext, listOpenReportGroups} from "../data-access/reports/reports.server";

/**
 * Gate for every /admin route. Non-admins and guests get a 404 (not a redirect), so the
 * area does not reveal itself. Child loaders re-check, since loaders run in parallel.
 */
export async function loader({request}: LoaderFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    const [{openCount}, pendingCount, unmatchedCount] = await Promise.all([
        listOpenReportGroups(admin.supabase),
        countPendingCampaigns(admin.supabase),
        countOpenUnmatched(admin.supabase),
    ]);
    return data({openCount, pendingCount, unmatchedCount}, {headers: admin.headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Layout() {
    return <Outlet/>;
}
