import {useActionData, useLoaderData, data, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {dismissReports, getAdminContext, listOpenReportGroups} from "../data-access/reports/reports.server";
import {ReportsTab} from "@/features/admin/reports-tab";

export async function loader({request}: LoaderFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    const {groups} = await listOpenReportGroups(admin.supabase);
    return data({groups}, {headers: admin.headers});
}

export async function action({request}: ActionFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    const form = await request.formData();
    const ids = form.getAll("reportId").filter((v): v is string => typeof v === "string");
    if (form.get("intent") !== "dismiss" || ids.length === 0) {
        return data({error: "Nothing to dismiss."}, {status: 400, headers: admin.headers});
    }
    const ok = await dismissReports(admin.supabase, ids);
    return data(ok ? {ok: true} : {error: "Could not dismiss reports."}, {
        status: ok ? 200 : 500,
        headers: admin.headers,
    });
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    const {groups} = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>() as {error?: string} | undefined;
    return (
        <div className="space-y-4">
            {actionData?.error ? <p role="alert" className="text-sm text-destructive">{actionData.error}</p> : null}
            <ReportsTab groups={groups}/>
        </div>
    );
}
