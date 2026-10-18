import {describe, expect, it} from "vitest";
import {campaignPageUrl} from "./campaign-url";

describe("campaignPageUrl", () => {
    it("uses SITE_URL when it is set, without a trailing slash", () => {
        expect(campaignPageUrl("clean-water", "https://crowdup.example/", "http://evil.example/x", true))
            .toBe("https://crowdup.example/campaigns/clean-water");
    });
    it("ignores the request host when SITE_URL is set", () => {
        expect(campaignPageUrl("a", "https://crowdup.example", "http://evil.example/", false))
            .toBe("https://crowdup.example/campaigns/a");
    });
    it("falls back to the request origin outside production", () => {
        expect(campaignPageUrl("a", undefined, "http://localhost:5173/campaigns/a/thanks", false))
            .toBe("http://localhost:5173/campaigns/a");
    });
    it("refuses to guess the origin in production", () => {
        expect(() => campaignPageUrl("a", undefined, "https://x.example/", true)).toThrow(/SITE_URL must be set/);
    });
    it("encodes the slug", () => {
        expect(campaignPageUrl("a b", "https://crowdup.example", "https://x/", true))
            .toBe("https://crowdup.example/campaigns/a%20b");
    });
});
