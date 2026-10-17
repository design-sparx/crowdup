// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from "vitest";
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

/** Runs the real inline script against a fake storage and system preference. */
function runInitScript(stored: string | null, prefersDark: boolean): boolean {
    vi.stubGlobal("matchMedia", () => ({matches: prefersDark}));
    if (stored === null) localStorage.removeItem("theme");
    else localStorage.setItem("theme", stored);
    document.documentElement.classList.remove("dark");
    new Function(themeInitScript)();
    return document.documentElement.classList.contains("dark");
}

describe("themeInitScript", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        localStorage.clear();
        document.documentElement.classList.remove("dark");
    });

    // The script cannot import resolveTheme (it runs inline before the bundle loads), so this
    // table is what keeps the two copies of the logic from drifting apart.
    it.each([
        [null, true],
        [null, false],
        ["light", true],
        ["light", false],
        ["dark", true],
        ["dark", false],
        ["garbage", true],
        ["garbage", false],
    ])("matches resolveTheme for stored=%s prefersDark=%s", (stored, prefersDark) => {
        expect(runInitScript(stored, prefersDark)).toBe(resolveTheme(stored, prefersDark) === "dark");
    });

    it("does not throw when storage is blocked", () => {
        vi.stubGlobal("matchMedia", () => ({matches: false}));
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("blocked");
        });
        expect(() => new Function(themeInitScript)()).not.toThrow();
    });
});
