import {createServerClient, parseCookieHeader, serializeCookieHeader} from "@supabase/ssr";
import {parseAuthConfig, type AuthConfig} from "./authConfig";

let cached: AuthConfig | undefined;

/** Server-only config. Never import this from client code (the .server suffix enforces it). */
export function getAuthConfig(): AuthConfig {
    return (cached ??= parseAuthConfig(process.env));
}

/**
 * Supabase client bound to the request's cookies. Cookies Supabase wants to set (session
 * refresh, PKCE verifier) are collected in `headers`; the caller must attach them to the
 * response, e.g. `redirect(url, {headers})`.
 */
export function createSupabaseServerClient(request: Request) {
    const config = getAuthConfig();
    const headers = new Headers();
    const supabase = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
        cookies: {
            getAll() {
                return parseCookieHeader(request.headers.get("Cookie") ?? "")
                    .map(({name, value}) => ({name, value: value ?? ""}));
            },
            setAll(cookies, cacheHeaders) {
                for (const {name, value, options} of cookies) {
                    headers.append("Set-Cookie", serializeCookieHeader(name, value, options));
                }
                for (const [key, value] of Object.entries(cacheHeaders ?? {})) headers.set(key, value);
            },
        },
    });
    return {supabase, headers, config};
}

/** Public origin used for auth email links and OAuth redirects. */
export function siteOrigin(request: Request, config: AuthConfig): string {
    return config.siteUrl ?? new URL(request.url).origin;
}
