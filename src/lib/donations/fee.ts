/**
 * Platform fee. Configured with PLATFORM_FEE_PERCENT (default 0 = no fee).
 *
 * The fee is a percentage of the donation, computed in integer minor units with
 * round-half-up (so 50.5 becomes 51 and 50.45 becomes 50), using integer arithmetic so
 * there is no floating-point drift. The percentage may have at most 2 decimals and is
 * capped at MAX_PLATFORM_FEE_PERCENT so a typo cannot take a donation. A fee of 0 means
 * callers must NOT send `application_fee_amount` to Stripe at all.
 */
export const MAX_PLATFORM_FEE_PERCENT = 30;

export function parsePlatformFeePercent(raw: string | undefined): number {
    const text = raw?.trim() ?? "";
    if (text === "") return 0;
    const invalid = () =>
        new Error(`PLATFORM_FEE_PERCENT must be a number from 0 to ${MAX_PLATFORM_FEE_PERCENT} with at most 2 decimals (got "${text}")`);
    if (!/^\d+(\.\d{1,2})?$/.test(text)) throw invalid();
    const value = Number(text);
    if (value > MAX_PLATFORM_FEE_PERCENT) throw invalid();
    return value;
}

/** Fee in minor units for an amount in minor units. */
export function calculatePlatformFee(amountMinor: number, percent: number): number {
    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error("amount must be a positive integer of minor units");
    const hundredths = Math.round(percent * 100); // percent has at most 2 decimals
    return Math.floor((amountMinor * hundredths + 5000) / 10000);
}

/** Reads and validates the configured percentage from the environment. */
export function getPlatformFeePercent(env: Record<string, string | undefined> = process.env): number {
    return parsePlatformFeePercent(env.PLATFORM_FEE_PERCENT);
}
