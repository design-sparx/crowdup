import {buildMeta} from "../helpers";
import {data} from "react-router";
import {MyDonationsPage} from "@/features/donate/my-donations-page";
import {requireUserClient} from "../data-access/auth/auth.server";
import {listMyDonations} from "../data-access/donations/history";
import type {Route} from "./+types/my-donations";

// requireUserClient redirects to login when signed out.
export async function loader({request}: Route.LoaderArgs) {
    const {supabase, headers} = await requireUserClient(request);
    return data({donations: await listMyDonations(supabase)}, {headers});
}

export default function MyDonations({loaderData}: Route.ComponentProps) {
    return <MyDonationsPage donations={loaderData.donations}/>;
}

export {Error404Page as ErrorBoundary} from "../pages";

export function meta() {
    return buildMeta({title: "My donations", description: "Donations you have made on CrowdUp."});
}
