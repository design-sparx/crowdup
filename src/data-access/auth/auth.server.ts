import {redirect} from "react-router";
import {createSupabaseServerClient, siteOrigin} from "./supabase.server";
import {safeRedirect} from "./safeRedirect";

import type {AuthActionResult} from "./index";

function field(form: FormData, name: string): string {
    const value = form.get(name);
    return typeof value === "string" ? value.trim() : "";
}

/** Current user verified with the Auth server (not just the cookie), or null. */
export async function getUser(request: Request) {
    const {supabase, headers} = createSupabaseServerClient(request);
    const {data} = await supabase.auth.getUser();
    return {user: data.user, headers};
}

/** Redirects to /login?next=<current path> when signed out. For use in protected loaders. */
export async function requireUser(request: Request) {
    const {user, headers} = await getUser(request);
    if (!user) {
        const url = new URL(request.url);
        throw redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`);
    }
    return {user, headers};
}

/**
 * Like requireUser, but also returns the cookie-bound Supabase client so data-access calls
 * run as the signed-in user and row-level security applies.
 */
export async function requireUserClient(request: Request) {
    const {supabase, headers} = createSupabaseServerClient(request);
    const {data} = await supabase.auth.getUser();
    if (!data.user) {
        const url = new URL(request.url);
        throw redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`);
    }
    return {user: data.user, supabase, headers};
}

export function isGoogleEnabled(request: Request): boolean {
    return createSupabaseServerClient(request).config.googleEnabled;
}

export async function signUpWithPassword(request: Request, form: FormData) {
    const {supabase, headers, config} = createSupabaseServerClient(request);
    const email = field(form, "email");
    const password = String(form.get("password") ?? "");
    const name = field(form, "name");
    if (!email || password.length < 8) {
        return {result: {error: "Enter an email and a password of at least 8 characters."} as AuthActionResult, headers};
    }
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {full_name: name},
            emailRedirectTo: `${siteOrigin(request, config)}/auth/callback`,
        },
    });
    if (error) return {result: {error: error.message} as AuthActionResult, headers};
    if (!data.session) {
        return {result: {message: "Check your email to confirm your account."} as AuthActionResult, headers};
    }
    throw redirect(safeRedirect(field(form, "next")), {headers});
}

export async function signInWithPassword(request: Request, form: FormData) {
    const {supabase, headers} = createSupabaseServerClient(request);
    const {error} = await supabase.auth.signInWithPassword({
        email: field(form, "email"),
        password: String(form.get("password") ?? ""),
    });
    if (error) return {result: {error: "Invalid email or password."} as AuthActionResult, headers};
    throw redirect(safeRedirect(field(form, "next")), {headers});
}

export async function startGoogleSignIn(request: Request, form: FormData) {
    const {supabase, headers, config} = createSupabaseServerClient(request);
    if (!config.googleEnabled) return {result: {error: "Google sign-in is not enabled."} as AuthActionResult, headers};
    const next = safeRedirect(field(form, "next"));
    const {data, error} = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${siteOrigin(request, config)}/auth/callback?next=${encodeURIComponent(next)}`,
            skipBrowserRedirect: true,
        },
    });
    if (error || !data.url) return {result: {error: "Could not start Google sign-in."} as AuthActionResult, headers};
    throw redirect(data.url, {headers});
}

export async function requestPasswordReset(request: Request, form: FormData) {
    const {supabase, headers, config} = createSupabaseServerClient(request);
    const email = field(form, "email");
    if (email) {
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteOrigin(request, config)}/auth/callback?next=/update-password`,
        });
    }
    // Same answer whether or not the account exists, so it cannot be used to probe emails.
    return {
        result: {message: "If an account exists for that email, a reset link is on its way."} as AuthActionResult,
        headers,
    };
}

export async function updatePassword(request: Request, form: FormData) {
    const {supabase, headers} = createSupabaseServerClient(request);
    const password = String(form.get("password") ?? "");
    if (password.length < 8) {
        return {result: {error: "Password must be at least 8 characters."} as AuthActionResult, headers};
    }
    const {error} = await supabase.auth.updateUser({password});
    if (error) return {result: {error: error.message} as AuthActionResult, headers};
    throw redirect("/dashboard", {headers});
}

export async function signOut(request: Request) {
    const {supabase, headers} = createSupabaseServerClient(request);
    await supabase.auth.signOut();
    throw redirect("/", {headers});
}

/** Exchanges the `code` from OAuth / email links for a session cookie. */
export async function exchangeCode(request: Request) {
    const url = new URL(request.url);
    const {supabase, headers} = createSupabaseServerClient(request);
    const code = url.searchParams.get("code");
    const next = safeRedirect(url.searchParams.get("next"));
    if (code) {
        const {error} = await supabase.auth.exchangeCodeForSession(code);
        if (!error) throw redirect(next, {headers});
    }
    throw redirect("/login?error=callback", {headers});
}
