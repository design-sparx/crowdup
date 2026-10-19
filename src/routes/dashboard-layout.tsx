import {data, Outlet, useLoaderData, type LoaderFunctionArgs} from "react-router";
import {requireUser} from "../data-access/auth/auth.server";
import {SitePage} from "@/components/shell/site-page";

export async function loader({request}: LoaderFunctionArgs) {
    const {user, headers} = await requireUser(request);
    const meta = user.user_metadata as {full_name?: string; avatar_url?: string} | undefined;
    return data(
        {account: {name: meta?.full_name ?? user.email ?? "Account", avatar: meta?.avatar_url ?? null}},
        {headers},
    );
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Layout() {
    const {account} = useLoaderData<typeof loader>();
    return (
        <SitePage account={account}>
            <Outlet/>
        </SitePage>
    );
}
