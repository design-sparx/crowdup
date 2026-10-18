import {data} from "react-router";
import {getOwnSuspension} from "../data-access/moderation/moderation.server";
import {userSuspensionNotice} from "../lib/moderation/moderation";
import {requireUserClient} from "../data-access/auth/auth.server";
import {getDashboardData} from "../data-access/campaigns/dashboard";
import {getPublishingMode, readConnectSummary} from "../data-access/stripe/connect.server";
import type {Route} from "./+types/dashboard";
import {DashboardPage} from "@/features/organiser/dashboard-page";

export async function loader({request}: Route.LoaderArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const [{campaigns, donations}, connect] = await Promise.all([
        getDashboardData(supabase, user.id),
        readConnectSummary(supabase, user.id),
    ]);
    const own = await getOwnSuspension(supabase, user.id);
    const moderationNotice = userSuspensionNotice(own.suspended, own.reason);
    const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
    const notice = new URL(request.url).searchParams.get("stripe");
    return data(
        {campaigns, donations, name, now: new Date().toISOString(), connect, mode: getPublishingMode(), notice, moderationNotice},
        {headers},
    );
}

export default function Dashboard({loaderData}: Route.ComponentProps) {
    const {campaigns, donations, name, now, connect, mode, notice, moderationNotice} = loaderData;
    return (
        <DashboardPage
            name={name}
            campaigns={campaigns}
            donations={donations}
            stripeStatus={connect.status}
            currency={connect.currency}
            moderationNotice={moderationNotice}
            notice={notice}
            mode={mode}
            now={now}
        />
    );
}

export {Error404Page as ErrorBoundary} from "../pages";
