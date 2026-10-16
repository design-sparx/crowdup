import {data, useLoaderData} from "react-router";
import {requireUserClient} from "../data-access/auth/auth.server";
import {listOwnCampaigns} from "../data-access/campaigns/ownerCampaigns";
import {getPublishingMode, readConnectSummary} from "../data-access/stripe/connect.server";
import {DashboardPage} from "../pages";
import {StripeStatusPanel} from "../components";
import type {Route} from "./+types/dashboard";

export async function loader({request}: Route.LoaderArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const [connect, campaigns] = await Promise.all([
        readConnectSummary(supabase, user.id),
        listOwnCampaigns(supabase, user.id),
    ]);
    const notice = new URL(request.url).searchParams.get("stripe");
    return data({connect, campaigns, mode: getPublishingMode(), notice}, {headers});
}

export default function Dashboard() {
    const {connect, campaigns, mode, notice} = useLoaderData<typeof loader>();
    return (
        <DashboardPage
            stripePanel={
                <StripeStatusPanel
                    status={connect.status}
                    currency={connect.currency}
                    mode={mode}
                    campaigns={campaigns}
                    notice={notice}
                />
            }
        />
    );
}

export {Error404Page as ErrorBoundary} from "../pages";
