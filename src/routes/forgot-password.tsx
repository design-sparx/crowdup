import {ComingSoonPage} from "../pages";
import {data, type ActionFunctionArgs} from "react-router";
import {requestPasswordReset} from "../data-access/auth/auth.server";

export async function action({request}: ActionFunctionArgs) {
    const {result, headers} = await requestPasswordReset(request, await request.formData());
    return data(result, {headers});
}

export {Error404Page as ErrorBoundary} from "../pages";

export default function Page() {
    return <ComingSoonPage title="Forgot password"/>;
}
