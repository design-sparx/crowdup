export type OnboardingStatus = "not_started" | "incomplete" | "connected";

/** The slice of a Stripe account the app cares about. */
export interface StripeAccountState {
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    defaultCurrency: string | null;
}

export const ONBOARDING_LABELS: Record<OnboardingStatus, string> = {
    not_started: "Not started",
    incomplete: "Incomplete",
    connected: "Connected",
};

/** Upper-cased ISO 4217 code, or null when the value is not a 3-letter code. */
export function accountCurrency(raw: string | null | undefined): string | null {
    const code = (raw ?? "").trim().toUpperCase();
    return /^[A-Z]{3}$/.test(code) ? code : null;
}

/** Onboarding is complete when the organiser can actually take charges in a known currency. */
export function isOnboardingComplete(account: StripeAccountState): boolean {
    return account.detailsSubmitted && account.chargesEnabled && accountCurrency(account.defaultCurrency) !== null;
}

export function onboardingStatus(p: {accountId: string | null; complete: boolean}): OnboardingStatus {
    if (p.complete) return "connected";
    return p.accountId ? "incomplete" : "not_started";
}

/** Currency a new campaign must use, or null while the organiser is not connected. */
export function pickCampaignCurrency(p: {complete: boolean; currency: string | null}): string | null {
    return p.complete ? accountCurrency(p.currency) : null;
}
