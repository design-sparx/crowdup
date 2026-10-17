import {minorUnitExponent} from "../donations/amount";

/** Largest goal in major units; keeps the minor-unit value inside a safe integer. */
const MAX_GOAL_MAJOR = 100_000_000;

/**
 * A draft has no currency yet (it is fixed from the Stripe account at go-live), so its goal
 * is stored provisionally in hundredths. `rescaleProvisionalGoal` converts it at go-live.
 */
const PROVISIONAL_EXPONENT = 2;

const exponentFor = (currency: string | null) => (currency ? minorUnitExponent(currency) : PROVISIONAL_EXPONENT);

/** Parses what the organiser typed (major units) into minor units of `currency`. */
export function parseGoal(raw: string, currency: string | null): number | null {
    const exp = exponentFor(currency);
    const match = /^(\d{1,9})(?:\.(\d+))?$/.exec(raw);
    if (!match) return null;
    const [, whole, frac = ""] = match;
    if (frac.length > exp) return null;
    const minor = Number(whole + frac.padEnd(exp, "0"));
    return minor > 0 && minor <= MAX_GOAL_MAJOR * 10 ** exp ? minor : null;
}

/** Converts a draft's provisional goal (hundredths) into the minor units of its new currency. */
export function rescaleProvisionalGoal(provisional: number, currency: string): number {
    return Math.max(1, Math.round((provisional * 10 ** minorUnitExponent(currency)) / 10 ** PROVISIONAL_EXPONENT));
}

/** Renders a stored goal as the plain major-unit text the form field expects. */
export function goalToInput(minor: number, currency: string | null): string {
    const exp = exponentFor(currency);
    return String(minor / 10 ** exp);
}

/**
 * The goal a draft carries into go-live. A draft that never had a currency holds its goal in
 * hundredths and is rescaled. A reopened rejected campaign already has its currency, so its
 * goal is already in that currency's minor units and must be kept as is.
 */
export function goalAtGoLive(draft: {goal: number; currentCurrency: string | null}, currency: string): number {
    return draft.currentCurrency ? draft.goal : rescaleProvisionalGoal(draft.goal, currency);
}
