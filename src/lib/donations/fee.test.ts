import {describe, expect, it} from "vitest";
import {calculatePlatformFee, MAX_PLATFORM_FEE_PERCENT, parsePlatformFeePercent} from "./fee";

describe("parsePlatformFeePercent", () => {
    it("defaults to 0 when unset or blank", () => {
        expect(parsePlatformFeePercent(undefined)).toBe(0);
        expect(parsePlatformFeePercent("")).toBe(0);
        expect(parsePlatformFeePercent("  ")).toBe(0);
    });
    it("parses whole and fractional percentages", () => {
        expect(parsePlatformFeePercent("5")).toBe(5);
        expect(parsePlatformFeePercent("2.5")).toBe(2.5);
        expect(parsePlatformFeePercent(`${MAX_PLATFORM_FEE_PERCENT}`)).toBe(MAX_PLATFORM_FEE_PERCENT);
    });
    it.each(["-1", "abc", "NaN", "Infinity", "1.234", "30.01", "5%", "1e1"])("rejects %s", (raw) => {
        expect(() => parsePlatformFeePercent(raw)).toThrow(/PLATFORM_FEE_PERCENT/);
    });
});

describe("calculatePlatformFee", () => {
    it("is 0 when the percentage is 0", () => {
        expect(calculatePlatformFee(5000, 0)).toBe(0);
    });
    it("takes the percentage of the amount in minor units", () => {
        expect(calculatePlatformFee(10000, 5)).toBe(500);
        expect(calculatePlatformFee(10000, 2.5)).toBe(250);
    });
    it("rounds half up to a whole minor unit", () => {
        expect(calculatePlatformFee(1010, 5)).toBe(51); // 50.5 -> 51
        expect(calculatePlatformFee(1009, 5)).toBe(50); // 50.45 -> 50
        expect(calculatePlatformFee(1, 30)).toBe(0); // 0.3 -> 0
    });
    it("always returns an integer below the amount", () => {
        for (const amount of [1, 2, 3, 99, 12345]) {
            const fee = calculatePlatformFee(amount, MAX_PLATFORM_FEE_PERCENT);
            expect(Number.isInteger(fee)).toBe(true);
            expect(fee).toBeLessThan(amount);
        }
    });
    it("rejects amounts that are not positive integers", () => {
        expect(() => calculatePlatformFee(0, 5)).toThrow();
        expect(() => calculatePlatformFee(10.5, 5)).toThrow();
        expect(() => calculatePlatformFee(-1, 5)).toThrow();
    });
});
