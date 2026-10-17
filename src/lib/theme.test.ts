import {describe, expect, it} from "vitest";
import {resolveTheme, themeInitScript} from "./theme";

describe("resolveTheme", () => {
    it("follows the system when nothing is stored", () => {
        expect(resolveTheme(null, true)).toBe("dark");
        expect(resolveTheme(null, false)).toBe("light");
    });
    it("a stored light or dark choice beats the system", () => {
        expect(resolveTheme("light", true)).toBe("light");
        expect(resolveTheme("dark", false)).toBe("dark");
    });
    it("treats an unknown stored value like nothing stored", () => {
        expect(resolveTheme("garbage", false)).toBe("light");
        expect(resolveTheme("garbage", true)).toBe("dark");
    });
});

describe("themeInitScript", () => {
    it("reads the same storage key the toggle writes", () => {
        expect(themeInitScript).toContain('"theme"');
    });
});
