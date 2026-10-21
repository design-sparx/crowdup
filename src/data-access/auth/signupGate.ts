export const SIGNUP_GATE_WARNING =
    "AUTH_SIGNUP_ENABLED is off, but Supabase still allows new sign-ups, so anyone with your project URL " +
    "and anon key can create accounts. Turn off Authentication > Sign In / Providers > Allow new users to sign up.";

/** True when Supabase's /auth/v1/settings payload says new sign-ups are disabled. */
function supabaseSignupDisabled(settings: unknown): boolean | null {
    if (typeof settings !== "object" || settings === null) return null;
    const value = (settings as {disable_signup?: unknown}).disable_signup;
    return typeof value === "boolean" ? value : null;
}

/** A warning when the app disables signup but Supabase does not; null when consistent or unknown. */
export function signupGateMismatch(appSignupEnabled: boolean, settings: unknown): string | null {
    if (appSignupEnabled) return null;
    return supabaseSignupDisabled(settings) === false ? SIGNUP_GATE_WARNING : null;
}
