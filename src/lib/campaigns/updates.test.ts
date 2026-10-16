import {describe, expect, it} from "vitest";
import {MAX_UPDATE_LENGTH, parseUpdateBody} from "./updates";

describe("parseUpdateBody", () => {
    it("trims and accepts a normal body", () => {
        expect(parseUpdateBody("  Thank you all!  ")).toEqual({ok: true, body: "Thank you all!"});
    });
    it("rejects empty and whitespace-only bodies", () => {
        expect(parseUpdateBody("").ok).toBe(false);
        expect(parseUpdateBody("   \n ").ok).toBe(false);
    });
    it("rejects non-strings", () => {
        expect(parseUpdateBody(null).ok).toBe(false);
        expect(parseUpdateBody(new File([], "x")).ok).toBe(false);
    });
    it("accepts exactly the maximum and rejects one more", () => {
        expect(parseUpdateBody("a".repeat(MAX_UPDATE_LENGTH)).ok).toBe(true);
        expect(parseUpdateBody("a".repeat(MAX_UPDATE_LENGTH + 1)).ok).toBe(false);
    });
    it("keeps markup as literal text (escaping happens at render)", () => {
        expect(parseUpdateBody("<b>hi</b>")).toEqual({ok: true, body: "<b>hi</b>"});
    });
});
