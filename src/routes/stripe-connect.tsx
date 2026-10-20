import Stripe from "stripe";
import {data, redirect, type ActionFunctionArgs} from "react-router";
import {requireUser} from "../data-access/auth/auth.server";
import {beginOnboarding} from "../data-access/stripe/connect.server";
import type {StripeConnectActionData} from "../lib/stripe/connectAction";

/*
 * POST only, so a cross-site link or image cannot start onboarding for a signed-in user.
 *
 * `StripeConnectActionData` describes what the callers (StripeStatus, NextStepCard) receive when
 * onboarding fails, so they can type their fetchers and show the message inline.
 * The `errorMessage` helper is exported for its unit test.
 */

export async function loader() {
    return redirect("/dashboard");
}

export function errorMessage(e: unknown): string {
    // A Stripe request that failed on their side (usually the platform has not enabled Connect)
    // explains itself better than we can, so prefer their wording over our generic one.
    if (e instanceof Stripe.errors.StripeError && e.message) return e.message;
    return "We could not reach Stripe. Please try again in a moment.";
}

export async function action({request}: ActionFunctionArgs) {
    const {user, headers} = await requireUser(request);
    try {
        const url = await beginOnboarding(request, user);
        return redirect(url, {headers});
    } catch (e) {
        console.error("Stripe onboarding could not start", e);
        return data({error: errorMessage(e)} satisfies StripeConnectActionData, {status: 502, headers});
    }
}
