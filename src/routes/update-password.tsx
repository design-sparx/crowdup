import {data, useActionData, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
import {UpdatePasswordPage} from "@/features/auth/update-password-page";
import {requireUser, updatePassword} from "../data-access/auth/auth.server";

export async function loader({request}: LoaderFunctionArgs) {
    const {headers} = await requireUser(request);
    return data(null, {headers});
}

export async function action({request}: ActionFunctionArgs) {
    await requireUser(request);
    const {result, headers} = await updatePassword(request, await request.formData());
    return data(result, {headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    const actionData = useActionData<typeof action>();
    return <UpdatePasswordPage error={actionData?.error}/>;
}
