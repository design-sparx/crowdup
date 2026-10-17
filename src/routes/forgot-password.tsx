import {data, type ActionFunctionArgs} from "react-router";
import {requestPasswordReset} from "../data-access/auth/auth.server";

export async function action({request}: ActionFunctionArgs) {
    const {result, headers} = await requestPasswordReset(request, await request.formData());
    return data(result, {headers});
}

export {ForgotPasswordPage as default, Error404Page as ErrorBoundary} from "../pages";
