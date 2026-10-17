import {minorUnitExponent} from "../lib/donations/amount";

export function formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {style: "currency", currency}).format(amount);
}

/** Formats an amount stored in minor units (e.g. cents), as the database does. */
export function formatMinorAmount(minor: number, currency: string): string {
    return formatAmount(minor / 10 ** minorUnitExponent(currency), currency);
}
