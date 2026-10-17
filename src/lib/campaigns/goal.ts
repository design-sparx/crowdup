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

/**
 * Converts a draft's provisional goal (hundredths) into the minor units of its new currency.
 * Returns null when the currency cannot represent it exactly (for example 10.50 in JPY, or a
 * goal below one whole unit): go-live must refuse rather than silently change the goal.
 */
export function rescaleProvisionalGoal(provisional: number, currency: string): number | null {
    const exp = minorUnitExponent(currency);
    if (exp >= PROVISIONAL_EXPONENT) return provisional * 10 ** (exp - PROVISIONAL_EXPONENT);
    const step = 10 ** (PROVISIONAL_EXPONENT - exp);
    return provisional % step === 0 && provisional >= step ? provisional / step : null;
}

/** Renders a stored goal as the plain major-unit text the form field expects. */
export function goalToInput(minor: number, currency: string | null): string {
    const exp = exponentFor(currency);
    return String(minor / 10 ** exp);
}

/**
 * The goal a draft carries into go-live. A draft that never had a currency holds its goal in
 * hundredths and is rescaled. A reopened rejected campaign already has its currency, so its
 * goal is already in that currency's minor units and must be kept as is. Null means the
 * goal cannot be expressed in the currency, so the campaign must not go live.
 */
export function goalAtGoLive(draft: {goal: number; currentCurrency: string | null}, currency: string): number | null {
    return draft.currentCurrency ? draft.goal : rescaleProvisionalGoal(draft.goal, currency);
}
