import {redirect} from "react-router";
import {createSupabaseServerClient, siteOrigin} from "./supabase.server";
import {safeRedirect} from "./safeRedirect";
import {consentAccepted} from "./signup-consent";

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

export function isSignupEnabled(request: Request): boolean {
    return createSupabaseServerClient(request).config.signupEnabled;
}

export async function signUpWithPassword(request: Request, form: FormData) {
    const {supabase, headers, config} = createSupabaseServerClient(request);
    if (!config.signupEnabled) {
        return {result: {error: "This site does not accept new registrations."} as AuthActionResult, headers};
    }
    const email = field(form, "email");
    const password = String(form.get("password") ?? "");
    const name = field(form, "name");
    if (!email || password.length < 8) {
        return {result: {error: "Enter an email and a password of at least 8 characters."} as AuthActionResult, headers};
    }
    if (!consentAccepted(form)) {
        return {result: {error: "Tick the box to agree to the Terms and Privacy Policy."} as AuthActionResult, headers};
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

/**
 * True when an identity was created moments ago — i.e. by the sign-in that just happened,
 * so the OAuth callback created a brand-new account rather than loading an existing one.
 */
export function isNewIdentity(created_at: string | undefined, nowMs: number = Date.now()): boolean {
    if (!created_at) return false;
    const createdAtMs = Date.parse(created_at);
    if (Number.isNaN(createdAtMs)) return false;
    return nowMs - createdAtMs < 5 * 60 * 1000;
}

/**
 * Exchanges the `code` from OAuth / email links for a session cookie.
 * When signup is disabled, a code that created a new account is rejected: this instance
 * only lets already-provisioned people in (seed data or the operator's SQL).
 */
export async function exchangeCode(request: Request) {
    const url = new URL(request.url);
    const {supabase, headers, config} = createSupabaseServerClient(request);
    const code = url.searchParams.get("code");
    const next = safeRedirect(url.searchParams.get("next"));
    if (code) {
        const {data, error} = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const createdAccount = data.user?.identities?.some(identity => isNewIdentity(identity.created_at));
            if (createdAccount && !config.signupEnabled) {
                await supabase.auth.signOut();
                throw redirect("/login?error=signup-disabled", {headers});
            }
            throw redirect(next, {headers});
        }
    }
    throw redirect("/login?error=callback", {headers});
}
