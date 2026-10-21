import {data, Outlet, useLocation, useLoaderData, type LoaderFunctionArgs} from "react-router";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {InboxTabs, type InboxTab} from "@/features/admin/inbox-tabs";
import {countPendingCampaigns} from "../data-access/campaigns/approval.server";
import {countOpenUnmatched} from "../data-access/payments/unmatched.server";
import {getSignupGateWarning} from "../data-access/auth/signupGate.server";
import {getAdminContext, listOpenReportGroups} from "../data-access/reports/reports.server";

/**
 * Gate for every /admin route. Non-admins and guests get a 404 (not a redirect), so the
 * area does not reveal itself. Child loaders re-check, since loaders run in parallel.
 */
export async function loader({request}: LoaderFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    const [{openCount}, pendingCount, unmatchedCount, signupWarning] = await Promise.all([
        listOpenReportGroups(admin.supabase),
        countPendingCampaigns(admin.supabase),
        countOpenUnmatched(admin.supabase),
        getSignupGateWarning(),
    ]);
    return data({openCount, pendingCount, unmatchedCount, signupWarning}, {headers: admin.headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

const TAB_BY_PATH: Record<string, InboxTab> = {
    "/admin/reports": "reports",
    "/admin/approvals": "approvals",
    "/admin/payments": "payments",
    "/admin/campaigns": "campaigns",
    "/admin/users": "users",
};

export default function Layout() {
    const {openCount, pendingCount, unmatchedCount, signupWarning} = useLoaderData<typeof loader>();
    const {pathname} = useLocation();
    const current = TAB_BY_PATH[pathname] ?? "reports";
    return (
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
            <header>
                <h1 className="text-3xl font-semibold">Admin</h1>
            </header>
            {signupWarning ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{signupWarning}</AlertDescription>
                </Alert>
            ) : null}
            <InboxTabs
                counts={{reports: openCount, approvals: pendingCount, payments: unmatchedCount}}
                current={current}
            />
            <Outlet/>
        </div>
    );
}
