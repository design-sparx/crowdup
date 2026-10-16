import {data} from "react-router";
import {DashboardPage} from "../pages";
import {requireUserClient} from "../data-access/auth/auth.server";
import {getDashboardData} from "../data-access/campaigns/dashboard";
import type {Route} from "./+types/dashboard";

export async function loader({request}: Route.LoaderArgs) {
    const {user, supabase, headers} = await requireUserClient(request);
    const {campaigns, donations} = await getDashboardData(supabase, user.id);
    const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
    return data({campaigns, donations, name, now: new Date().toISOString()}, {headers});
}

export default function Dashboard({loaderData}: Route.ComponentProps) {
    return <DashboardPage {...loaderData}/>;
}
