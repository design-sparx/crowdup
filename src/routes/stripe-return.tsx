import {redirect, type LoaderFunctionArgs} from "react-router";
import {requireUser} from "../data-access/auth/auth.server";
import {refreshOnboarding} from "../data-access/stripe/connect.server";

/**
 * Stripe sends the organiser back here after the hosted flow. The redirect itself proves
 * nothing, so status is re-read from Stripe for the signed-in user before anything changes.
 */
export async function loader({request}: LoaderFunctionArgs) {
    const {user, headers} = await requireUser(request);
    try {
        const result = await refreshOnboarding(user.id);
        return redirect(`/dashboard?stripe=${result.status}`, {headers});
    } catch (e) {
        console.error("Stripe status refresh failed", e);
        return redirect("/dashboard?stripe=error", {headers});
    }
}
