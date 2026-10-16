import {redirect, type ActionFunctionArgs} from "react-router";
import {signOut} from "../data-access/auth/auth.server";

// POST only, so a cross-site link or image cannot sign a user out.
export async function loader() {
    return redirect("/");
}

export async function action({request}: ActionFunctionArgs) {
    return signOut(request);
}
