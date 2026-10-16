import {data, type ActionFunctionArgs, type LoaderFunctionArgs} from "react-router";
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

export {UpdatePasswordPage as default, Error404Page as ErrorBoundary} from "../pages";
