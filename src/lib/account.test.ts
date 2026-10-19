import {describe, expect, it} from "vitest";
import {initials} from "./account";

describe("initials", () => {
    it("uses the first letters of the first two words", () => {
        expect(initials("Jane Doe")).toBe("JD");
        expect(initials("jane van der doe")).toBe("JV");
    });
    it("uses one letter for a single word or an email", () => {
        expect(initials("Jane")).toBe("J");
        expect(initials("jane@example.org")).toBe("J");
    });
    it("falls back to a question mark when there is nothing to use", () => {
        expect(initials("")).toBe("?");
        expect(initials("   ")).toBe("?");
    });
});
