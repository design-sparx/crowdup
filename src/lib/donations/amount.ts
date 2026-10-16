/**
 * Donation amounts. Stripe amounts are integers in the currency's minor unit, and the
 * number of minor-unit digits differs by currency (JPY has none, KWD has three).
 * Bounds are 1 to 100,000 in MAJOR units of whatever currency the campaign uses.
 */
export const MIN_DONATION_MAJOR = 1;
export const MAX_DONATION_MAJOR = 100_000;
export const DONATION_PRESETS_MAJOR = [10, 25, 50, 100] as const;

// Per Stripe's currency docs. Stripe treats ISK and UGX as two-decimal in the API, so
// they are deliberately absent from the zero-decimal list.
const ZERO_DECIMAL = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "VND", "VUV", "XAF", "XOF", "XPF"]);
const THREE_DECIMAL = new Set(["BHD", "IQD", "JOD", "KWD", "LYD", "OMR", "TND"]);

export function minorUnitExponent(currency: string): 0 | 2 | 3 {
    const code = currency.toUpperCase();
    if (ZERO_DECIMAL.has(code)) return 0;
    if (THREE_DECIMAL.has(code)) return 3;
    return 2;
}

export type AmountResult = {ok: true; minor: number} | {ok: false; error: string};

export function formatMinor(minor: number, currency: string): string {
    const exp = minorUnitExponent(currency);
    return new Intl.NumberFormat("en-US", {style: "currency", currency, minimumFractionDigits: exp, maximumFractionDigits: exp}).format(minor / 10 ** exp);
}

export function presetsMinor(currency: string): number[] {
    return DONATION_PRESETS_MAJOR.map((m) => m * 10 ** minorUnitExponent(currency));
}

/** Parses what a donor typed (major units, e.g. "12.50") into integer minor units. */
export function parseDonationAmount(raw: string, currency: string): AmountResult {
    const text = raw.trim();
    const exp = minorUnitExponent(currency);
    if (!/^\d+(\.\d+)?$/.test(text)) return {ok: false, error: "Enter a valid amount."};
    const [whole, frac = ""] = text.split(".");
    if (frac.length > exp) {
        return {ok: false, error: exp === 0 ? "This currency has no decimals." : `Use at most ${exp} decimal places.`};
    }
    // Digits only, so BigInt avoids any floating point and guards huge inputs.
    const minorBig = BigInt(whole + frac.padEnd(exp, "0"));
    const min = BigInt(MIN_DONATION_MAJOR) * 10n ** BigInt(exp);
    const max = BigInt(MAX_DONATION_MAJOR) * 10n ** BigInt(exp);
    if (minorBig < min) return {ok: false, error: `Donate at least ${formatMinor(Number(min), currency)}.`};
    if (minorBig > max) return {ok: false, error: `The maximum donation is ${formatMinor(Number(max), currency)}.`};
    return {ok: true, minor: Number(minorBig)};
}
