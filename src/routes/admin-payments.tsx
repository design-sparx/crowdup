import {buildMeta} from "../helpers";
import {useActionData, useLoaderData, data, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {getAdminContext} from "../data-access/reports/reports.server";
import {listOpenUnmatched, resolveUnmatched} from "../data-access/payments/unmatched.server";
import {PaymentsTab} from "@/features/admin/payments-tab";

export async function loader({request}: LoaderFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    return data({payments: await listOpenUnmatched(admin.supabase)}, {headers: admin.headers});
}

export async function action({request}: ActionFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    const form = await request.formData();
    const id = form.get("paymentId");
    if (form.get("intent") !== "resolve" || typeof id !== "string") {
        return data({error: "Unknown action."}, {status: 400, headers: admin.headers});
    }
    const result = await resolveUnmatched(admin.supabase, id);
    if (result === "resolved") return data({ok: true}, {headers: admin.headers});
    const status = result === "invalid" ? 400 : 404;
    return data({error: result === "invalid" ? "Unknown payment." : "Already reviewed."}, {status, headers: admin.headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    const {payments} = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>() as {error?: string} | undefined;
    return (
        <div className="space-y-4">
            {actionData?.error ? <p role="alert" className="text-sm text-destructive">{actionData.error}</p> : null}
            <PaymentsTab payments={payments}/>
        </div>
    );
}

export function meta() {
    return buildMeta({title: "Admin: payments", description: "Review payment activity."});
}
