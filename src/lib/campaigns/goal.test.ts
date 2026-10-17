import {describe, expect, it} from "vitest";
import {goalToInput, parseGoal, rescaleProvisionalGoal} from "./goal";

describe("parseGoal", () => {
    it("uses two decimals while the currency is not set yet", () => {
        expect(parseGoal("5000.50", null)).toBe(500050);
        expect(parseGoal("10.999", null)).toBeNull();
    });
    it("uses the currency's minor-unit exponent", () => {
        expect(parseGoal("1000", "JPY")).toBe(1000);
        expect(parseGoal("1000.5", "JPY")).toBeNull();
        expect(parseGoal("10.125", "KWD")).toBe(10125);
        expect(parseGoal("10.1255", "KWD")).toBeNull();
        expect(parseGoal("12.34", "USD")).toBe(1234);
    });
    it("rejects zero, junk and absurd values", () => {
        for (const raw of ["0", "abc", "", "1e9", "99999999999"]) expect(parseGoal(raw, "USD"), raw).toBeNull();
    });
});

describe("rescaleProvisionalGoal", () => {
    it("converts the draft's hundredths into the currency's minor units", () => {
        expect(rescaleProvisionalGoal(100000, "JPY")).toBe(1000);
        expect(rescaleProvisionalGoal(100000, "KWD")).toBe(1000000);
        expect(rescaleProvisionalGoal(100000, "USD")).toBe(100000);
    });
});

describe("goalToInput", () => {
    it("renders the stored goal back as what the organiser typed", () => {
        expect(goalToInput(500050, null)).toBe("5000.5");
        expect(goalToInput(1000, "JPY")).toBe("1000");
        expect(goalToInput(10125, "KWD")).toBe("10.125");
    });
});
