import {describe, expect, it} from "vitest";
import {goalToInput} from "./goal";

describe("goalToInput for the edit page", () => {
    it("shows a stored goal in major units, so the organiser sees 2500, not 250000", () => {
        expect(goalToInput(250000, "GBP")).toBe("2500");
    });
    it("uses no decimals for a zero-decimal currency", () => {
        expect(goalToInput(5000, "JPY")).toBe("5000");
    });
});
