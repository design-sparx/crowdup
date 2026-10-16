import {redirect, type ActionFunctionArgs} from "react-router";
import {requireUser} from "../data-access/auth/auth.server";
import {publishDraft} from "../data-access/stripe/connect.server";

/** Publishes the signed-in organiser's own draft once their Stripe account is connected. */
export async function loader() {
    return redirect("/dashboard");
}

export async function action({request, params}: ActionFunctionArgs) {
    const {user, headers} = await requireUser(request);
    const id = params.id ?? "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Response("Not found", {status: 404, headers});
    const result = await publishDraft(user.id, id);
    if (result === "not_found") throw new Response("Not found", {status: 404, headers});
    return redirect(`/campaigns/${id}/edit?publish=${result}`, {headers});
}
