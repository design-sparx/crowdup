import {describe, expect, it} from "vitest";
import {safeRedirect} from "./safeRedirect";

describe("safeRedirect", () => {
    it("keeps same-origin paths with query and hash", () => {
        expect(safeRedirect("/campaigns/1?a=b#c")).toBe("/campaigns/1?a=b#c");
    });

    it.each([
        "//evil.com",
        "/\\evil.com",
        "https://evil.com",
        "javascript:alert(1)",
        "evil.com",
        "/\t/evil.com",
        "/a\nb",
        "/a\\b",
        "",
        null,
        undefined,
        42,
    ])("rejects %j", (value) => {
        expect(safeRedirect(value)).toBe("/dashboard");
    });

    it("uses a custom fallback", () => {
        expect(safeRedirect("//x", "/")).toBe("/");
    });
});
