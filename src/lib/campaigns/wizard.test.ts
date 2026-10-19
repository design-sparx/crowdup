import {describe, expect, it} from "vitest";
import {CAMPAIGN_CATEGORIES, firstStepWithError, WIZARD_STEPS} from "./wizard";

describe("WIZARD_STEPS", () => {
    it("has the four steps in order", () => {
        expect(WIZARD_STEPS.map((s) => s.id)).toEqual(["basics", "story", "goal", "preview"]);
    });
    it("assigns each form field to exactly one step", () => {
        const fields = WIZARD_STEPS.flatMap((s) => s.fields);
        expect(new Set(fields).size).toBe(fields.length);
        expect(fields.sort()).toEqual(["category", "country", "cover", "description", "endDate", "goal", "story", "title"]);
    });
});

describe("firstStepWithError", () => {
    it("returns the index of the step holding the first field with an error", () => {
        expect(firstStepWithError({goal: "Enter a goal."})).toBe(2);
        expect(firstStepWithError({title: "Use a title of 3 to 140 characters."})).toBe(0);
    });
    it("picks the earliest step when errors span several", () => {
        expect(firstStepWithError({endDate: "x", title: "y"})).toBe(0);
    });
    it("returns null when there are no errors", () => {
        expect(firstStepWithError({})).toBeNull();
    });
    it("ignores form-level and cover errors that belong to no step", () => {
        expect(firstStepWithError({form: "Your account cannot create or edit campaigns right now."})).toBeNull();
    });
});

describe("CAMPAIGN_CATEGORIES", () => {
    it("lists the categories used by live campaigns, in a stable order", () => {
        expect(CAMPAIGN_CATEGORIES).toEqual(["Community", "Education", "Environment", "Food", "Other", "Sports"]);
    });
});
