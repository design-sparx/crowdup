import {data, type LoaderFunctionArgs} from "react-router";
import {requireUser} from "../data-access/auth/auth.server";

export async function loader({request}: LoaderFunctionArgs) {
    const {headers} = await requireUser(request);
    return data(null, {headers});
}

export {DashboardLayout as default} from "../layout";
export {Error404Page as ErrorBoundary} from "../pages";
