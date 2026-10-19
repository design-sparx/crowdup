import {getUser} from "./auth.server";
import type {Account} from "../../lib/account";

/** The signed-in person for the site header, or null. `headers` must go on the response. */
export async function getAccount(request: Request) {
    const {user, headers} = await getUser(request);
    const meta = user?.user_metadata as {full_name?: string; avatar_url?: string} | undefined;
    const account: Account | null = user
        ? {name: meta?.full_name ?? user.email ?? "Account", avatar: meta?.avatar_url ?? null}
        : null;
    return {account, headers};
}
