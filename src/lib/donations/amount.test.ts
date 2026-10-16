import {describe, expect, it} from "vitest";
import {DONATION_PRESETS_MAJOR, formatMinor, minorUnitExponent, parseDonationAmount, presetsMinor} from "./amount";

describe("minorUnitExponent", () => {
    it("handles two-decimal, zero-decimal and three-decimal currencies", () => {
        expect(minorUnitExponent("USD")).toBe(2);
        expect(minorUnitExponent("KES")).toBe(2);
        expect(minorUnitExponent("JPY")).toBe(0);
        expect(minorUnitExponent("KRW")).toBe(0);
        expect(minorUnitExponent("KWD")).toBe(3);
    });
    it("is case-insensitive", () => {
        expect(minorUnitExponent("jpy")).toBe(0);
    });
});

describe("parseDonationAmount", () => {
    it("converts a major-unit string to minor units", () => {
        expect(parseDonationAmount("25", "USD")).toEqual({ok: true, minor: 2500});
        expect(parseDonationAmount("12.34", "USD")).toEqual({ok: true, minor: 1234});
        expect(parseDonationAmount("12.5", "USD")).toEqual({ok: true, minor: 1250});
        expect(parseDonationAmount(" 7 ", "KES")).toEqual({ok: true, minor: 700});
    });
    it("uses no decimals for zero-decimal currencies", () => {
        expect(parseDonationAmount("500", "JPY")).toEqual({ok: true, minor: 500});
        expect(parseDonationAmount("500.5", "JPY").ok).toBe(false);
    });
    it("supports three-decimal currencies", () => {
        expect(parseDonationAmount("5.250", "KWD")).toEqual({ok: true, minor: 5250});
        expect(parseDonationAmount("5.2501", "KWD").ok).toBe(false);
    });
    it("rejects more precision than the currency allows", () => {
        expect(parseDonationAmount("1.234", "USD").ok).toBe(false);
    });
    it.each(["", "abc", "-5", "1e3", "1,000", "0x10", "NaN", "Infinity", "."])("rejects %j", (raw) => {
        expect(parseDonationAmount(raw, "USD").ok).toBe(false);
    });
    it("enforces the minimum and maximum", () => {
        expect(parseDonationAmount("0.99", "USD").ok).toBe(false);
        expect(parseDonationAmount("1", "USD").ok).toBe(true);
        expect(parseDonationAmount("100000", "USD").ok).toBe(true);
        expect(parseDonationAmount("100001", "USD").ok).toBe(false);
        expect(parseDonationAmount("0", "USD").ok).toBe(false);
    });
    it("explains a rejection", () => {
        const r = parseDonationAmount("0.5", "USD");
        expect(!r.ok && r.error).toMatch(/at least/i);
    });
});

describe("presets and formatting", () => {
    it("presets are in minor units for the currency", () => {
        expect(presetsMinor("USD")).toEqual(DONATION_PRESETS_MAJOR.map((m) => m * 100));
        expect(presetsMinor("JPY")).toEqual([...DONATION_PRESETS_MAJOR]);
    });
    it("formats minor units using the currency exponent", () => {
        expect(formatMinor(2550, "USD")).toBe("$25.50");
        expect(formatMinor(500, "JPY")).toBe("¥500");
    });
});
