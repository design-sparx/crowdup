/**
 * Shared names for the Connect onboarding action, so the route and the buttons that post to it
 * cannot drift apart. Safe to import from client code: this module has no server-only imports.
 */

/** The route that starts Stripe onboarding: `src/routes/stripe-connect.tsx`. */
export const CONNECT_STRIPE_ACTION = "/stripe/connect";

/** The value its action returns when onboarding could not start. */
export interface StripeConnectActionData {
    error: string;
}
