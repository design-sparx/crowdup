import {data} from "react-router";
import {getOwnSuspension} from "../data-access/moderation/moderation.server";
import {userSuspensionNotice} from "../lib/moderation/moderation";
import {ComingSoonPage} from "../pages";
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
    const own = await getOwnSuspension(supabase, user.id);
    const moderationNotice = userSuspensionNotice(own.suspended, own.reason);
    const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
    const notice = new URL(request.url).searchParams.get("stripe");
    return data(
        {campaigns, donations, name, now: new Date().toISOString(), connect, mode: getPublishingMode(), notice, moderationNotice},
        {headers},
    );
}

export default function Dashboard() {
    return <ComingSoonPage title="Dashboard"/>;
}

export {Error404Page as ErrorBoundary} from "../pages";
