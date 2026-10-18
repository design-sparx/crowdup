import {data, redirect, useActionData, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {LoginPage} from "@/features/auth/login-page";
import {getUser, isGoogleEnabled, signInWithPassword, startGoogleSignIn} from "../data-access/auth/auth.server";
import {safeRedirect} from "../data-access/auth/safeRedirect";

export async function loader({request}: LoaderFunctionArgs) {
    const {user, headers} = await getUser(request);
    const next = safeRedirect(new URL(request.url).searchParams.get("next"));
    if (user) throw redirect(next, {headers});
    return data({googleEnabled: isGoogleEnabled(request), next: safeRedirect(new URL(request.url).searchParams.get("next"))}, {headers});
}

export async function action({request}: ActionFunctionArgs) {
    const form = await request.formData();
    const run = form.get("intent") === "google" ? startGoogleSignIn : signInWithPassword;
    const {result, headers} = await run(request, form);
    return data(result, {headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    const {googleEnabled, next} = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    return <LoginPage next={next} googleEnabled={googleEnabled} error={actionData?.error}/>;
}
