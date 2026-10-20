import {data, redirect, useActionData, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {LoginPage} from "@/features/auth/login-page";
import {getUser, isGoogleEnabled, isSignupEnabled, signInWithPassword, startGoogleSignIn} from "../data-access/auth/auth.server";
import {safeRedirect} from "../data-access/auth/safeRedirect";

const SIGNUP_DISABLED_MESSAGE = "This site doesn't accept new registrations — ask the site team for an account.";

export async function loader({request}: LoaderFunctionArgs) {
    const {user, headers} = await getUser(request);
    const next = safeRedirect(new URL(request.url).searchParams.get("next"));
    if (user) throw redirect(next, {headers});
    const error = new URL(request.url).searchParams.get("error");
    return data(
        {
            googleEnabled: isGoogleEnabled(request),
            signupEnabled: isSignupEnabled(request),
            next,
            message: error === "signup-disabled" ? SIGNUP_DISABLED_MESSAGE : undefined,
        },
        {headers},
    );
}

export async function action({request}: ActionFunctionArgs) {
    const form = await request.formData();
    const run = form.get("intent") === "google" ? startGoogleSignIn : signInWithPassword;
    const {result, headers} = await run(request, form);
    return data(result, {headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    const {googleEnabled, signupEnabled, next, message} = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    return (
        <LoginPage
            next={next}
            googleEnabled={googleEnabled}
            signupEnabled={signupEnabled}
            error={actionData?.error}
            message={actionData?.error ? undefined : (actionData?.message ?? message)}
        />
    );
}
