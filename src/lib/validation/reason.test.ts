import {describe, expect, it} from "vitest";
import {REASON_MAX, REASON_MIN, parseReason} from "./reason";

describe("parseReason", () => {
    it("trims and accepts 3 to 1000 characters", () => {
        expect(parseReason("  Fraud  ")).toEqual({ok: true, reason: "Fraud"});
        expect(parseReason("abc")).toEqual({ok: true, reason: "abc"});
        expect(parseReason("a".repeat(1000))).toEqual({ok: true, reason: "a".repeat(1000)});
    });

    it("rejects non-strings, too short and too long values", () => {
        for (const v of [undefined, null, 42, "", "ab", "  ab  ", "a".repeat(1001)]) {
            expect(parseReason(v)).toMatchObject({ok: false});
        }
    });

    it("exposes the 3 and 1000 bounds", () => {
        expect(REASON_MIN).toBe(3);
        expect(REASON_MAX).toBe(1000);
    });
});
