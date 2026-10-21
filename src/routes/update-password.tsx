import {data, useActionData, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {UpdatePasswordPage} from "@/features/auth/update-password-page";
import {DEMO_DISABLED_MESSAGE, demoBlocksPasswordChange} from "../lib/demo/guard";
import {requireUser, updatePassword} from "../data-access/auth/auth.server";

export async function loader({request}: LoaderFunctionArgs) {
    const {headers} = await requireUser(request);
    return data(null, {headers});
}

export async function action({request}: ActionFunctionArgs) {
    const {headers: authHeaders} = await requireUser(request);
    if (demoBlocksPasswordChange(process.env)) {
        return data({error: DEMO_DISABLED_MESSAGE}, {status: 403, headers: authHeaders});
    }
    const {result, headers} = await updatePassword(request, await request.formData());
    return data(result, {headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    const actionData = useActionData<typeof action>();
    return <UpdatePasswordPage error={actionData?.error}/>;
}
