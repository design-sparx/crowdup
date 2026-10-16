import {redirect, type LoaderFunctionArgs} from "react-router";
import {getAdminContext} from "../data-access/reports/reports.server";

// Loaders run in parallel with the layout's, so this checks the role itself.
export async function loader({request}: LoaderFunctionArgs) {
    const admin = await getAdminContext(request);
    if (!admin) throw new Response("Not found", {status: 404});
    return redirect("/admin/reports", {headers: admin.headers});
}

export {Error404Page as ErrorBoundary} from "../pages";
