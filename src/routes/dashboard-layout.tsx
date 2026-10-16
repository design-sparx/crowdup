import {data, type LoaderFunctionArgs} from "react-router";
import {requireUser} from "../data-access/auth/auth.server";

export async function loader({request}: LoaderFunctionArgs) {
    const {user, headers} = await requireUser(request);
    const meta = user.user_metadata as {full_name?: string; avatar_url?: string} | undefined;
    return data(
        {account: {name: meta?.full_name ?? user.email ?? "Account", avatar: meta?.avatar_url ?? null}},
        {headers},
    );
}

export {DashboardLayout as default} from "../layout";
export {Error404Page as ErrorBoundary} from "../pages";
