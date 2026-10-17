import {describe, expect, it} from "vitest";
import {presetOptions, selectedPreset} from "./panel";

describe("presetOptions", () => {
    it("turns the currency's presets into major-unit strings with a display label", () => {
        const options = presetOptions("USD");
        expect(options.map((o) => o.value)).toEqual(["10", "25", "50", "100"]);
        expect(options[1].label).toBe("$25.00");
    });
    it("has no decimals for a zero-decimal currency", () => {
        const options = presetOptions("JPY");
        expect(options.map((o) => o.value)).toEqual(["10", "25", "50", "100"]);
        expect(options[0].label).toBe("¥10");
    });
});

describe("selectedPreset", () => {
    it("returns the preset that equals the typed amount", () => {
        expect(selectedPreset("25", "USD")).toBe("25");
    });
    it("ignores surrounding spaces", () => {
        expect(selectedPreset(" 50 ", "USD")).toBe("50");
    });
    it("returns null for a custom amount", () => {
        expect(selectedPreset("30", "USD")).toBeNull();
        expect(selectedPreset("25.5", "USD")).toBeNull();
        expect(selectedPreset("", "USD")).toBeNull();
    });
});