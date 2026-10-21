import {data, useActionData, type ActionFunctionArgs} from "react-router";
import {ForgotPasswordPage} from "@/features/auth/forgot-password-page";
import {demoBlocksPasswordChange} from "../lib/demo/guard";
import {requestPasswordReset} from "../data-access/auth/auth.server";

export async function action({request}: ActionFunctionArgs) {
    // Same neutral answer as a real request, so the demo does not send reset emails for shared accounts.
    if (demoBlocksPasswordChange(process.env)) {
        return data({message: "If an account exists for that email, a reset link is on its way."});
    }
    const {result, headers} = await requestPasswordReset(request, await request.formData());
    return data(result, {headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    const actionData = useActionData<typeof action>();
    return <ForgotPasswordPage message={actionData?.message}/>;
}
