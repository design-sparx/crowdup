import {data} from "react-router";
import {DashboardPage} from "../pages";
import {StripeStatusPanel} from "../components";
import {requireUserClient} from "../data-access/auth/auth.server";
import {getDashboardData} from "../data-access/campaigns/dashboard";
import {getPublishingMode, readConnectSummary} from "../data-access/stripe/connect.server";
import type {Route} from "./+types/dashboard";

export async function loader({request}: Route.LoaderArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const [{campaigns, donations}, connect] = await Promise.all([
        getDashboardData(supabase, user.id),
        readConnectSummary(supabase, user.id),
    ]);
    const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
    const notice = new URL(request.url).searchParams.get("stripe");
    return data(
        {campaigns, donations, name, now: new Date().toISOString(), connect, mode: getPublishingMode(), notice},
        {headers},
    );
}

export default function Dashboard({loaderData}: Route.ComponentProps) {
    const {connect, mode, notice, ...rest} = loaderData;
    return (
        <DashboardPage
            {...rest}
            stripePanel={
                <StripeStatusPanel
                    status={connect.status}
                    currency={connect.currency}
                    mode={mode}
                    campaigns={rest.campaigns}
                    notice={notice}
                />
            }
        />
    );
}

export {Error404Page as ErrorBoundary} from "../pages";
