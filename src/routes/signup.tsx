import {data, redirect, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {getUser, isGoogleEnabled, signUpWithPassword, startGoogleSignIn} from "../data-access/auth/auth.server";
import {safeRedirect} from "../data-access/auth/safeRedirect";

export async function loader({request}: LoaderFunctionArgs) {
    const {user, headers} = await getUser(request);
    const next = safeRedirect(new URL(request.url).searchParams.get("next"));
    if (user) throw redirect(next, {headers});
    return data({googleEnabled: isGoogleEnabled(request)}, {headers});
}

export async function action({request}: ActionFunctionArgs) {
    const form = await request.formData();
    const run = form.get("intent") === "google" ? startGoogleSignIn : signUpWithPassword;
    const {result, headers} = await run(request, form);
    return data(result, {headers});
}

export {SignupPage as default, Error404Page as ErrorBoundary} from "../pages";
