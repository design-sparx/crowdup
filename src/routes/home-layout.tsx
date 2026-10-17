import {data, Outlet, useLoaderData, type LoaderFunctionArgs} from "react-router";
import {SitePage} from "@/components/shell/site-page";
import {getAccount} from "../data-access/auth/account.server";
export {Error404Page as ErrorBoundary} from "../pages";

export async function loader({request}: LoaderFunctionArgs) {
    const {account, headers} = await getAccount(request);
    return data({account}, {headers});
}

export default function HomeLayout() {
    const {account} = useLoaderData<typeof loader>();
    return (
        <SitePage account={account}>
            <Outlet/>
        </SitePage>
    );
}
