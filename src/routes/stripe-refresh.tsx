import {redirect, type LoaderFunctionArgs} from "react-router";
import {requireUser} from "../data-access/auth/auth.server";
import {beginOnboarding} from "../data-access/stripe/connect.server";

/** Stripe sends the organiser here when an onboarding link expired; issue a fresh one. */
export async function loader({request}: LoaderFunctionArgs) {
    const {user, headers} = await requireUser(request);
    try {
        return redirect(await beginOnboarding(request, user), {headers});
    } catch (e) {
        console.error("Stripe onboarding refresh failed", e);
        return redirect("/dashboard?stripe=error", {headers});
    }
}
