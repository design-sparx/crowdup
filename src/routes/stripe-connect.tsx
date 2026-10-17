import {data, redirect, type ActionFunctionArgs} from "react-router";
import {requireUser} from "../data-access/auth/auth.server";
import {beginOnboarding} from "../data-access/stripe/connect.server";

// POST only, so a cross-site link or image cannot start onboarding for a signed-in user.
export async function loader() {
    return redirect("/dashboard");
}

export async function action({request}: ActionFunctionArgs) {
    const {user, headers} = await requireUser(request);
    try {
        const url = await beginOnboarding(request, user);
        return redirect(url, {headers});
    } catch (e) {
        console.error("Stripe onboarding could not start", e);
        return data({error: "We could not reach Stripe. Please try again in a moment."}, {status: 502, headers});
    }
}
