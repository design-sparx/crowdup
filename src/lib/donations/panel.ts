import {formatMinor, minorUnitExponent, presetsMinor} from "./amount";

export interface PresetOption {
    /** Major units as the form field wants them, e.g. "25". */
    value: string;
    /** Display text, e.g. "$25.00". */
    label: string;
}

export function presetOptions(currency: string): PresetOption[] {
    const exp = minorUnitExponent(currency);
    return presetsMinor(currency).map((minor) => ({
        value: String(minor / 10 ** exp),
        label: formatMinor(minor, currency),
    }));
}

/** The preset matching what the donor typed, or null for a custom amount. */
export function selectedPreset(amount: string, currency: string): string | null {
    const typed = amount.trim();
    return presetOptions(currency).find((o) => o.value === typed)?.value ?? null;
}